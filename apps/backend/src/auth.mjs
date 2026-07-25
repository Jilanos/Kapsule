// Adaptateur d'authentification : gestion des comptes et des sessions.
// Hachage scrypt (natif Node, zero dependance), tokens de session opaques
// stockes en base (pas de JWT : revocation simple, aucun secret a gerer).

import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const SCRYPT_KEYLEN = 64;
const SESSION_DAYS = 90;
// Borne de longueur du mot de passe AVANT hachage : scrypt sur une entree
// enorme est un vecteur de deni de service CPU (audit 2026-07-18, AC4).
export const MAX_PASSWORD_LENGTH = 256;
// Les ecritures de session (last_used_at / expires_at) ne sont rafraichies
// qu'au-dela de ce seuil : evite de transformer chaque lecture authentifiee en
// ecriture SQLite (ADR 003, AC10).
const SESSION_REFRESH_MS = 24 * 3600_000;
const DEFAULT_USER = "default";
export const hashSessionToken = (token) => createHash("sha256").update(token).digest("hex");

/**
 * Hache un mot de passe : renvoie "scrypt:<sel hex>:<hash hex>".
 * Asynchrone : ne bloque pas la boucle evenementielle (AC4).
 */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Verifie un mot de passe contre un hash stocke, en temps constant. */
export async function verifyPassword(password, stored) {
  const parts = String(stored).split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = await scryptAsync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const normalizeEmail = (email) =>
  String(email ?? "")
    .trim()
    .toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthStore {
  /** @param {import("better-sqlite3").Database} db */
  constructor(db) {
    this.db = db;
  }

  /**
   * L'inscription est-elle ouverte ?
   * - `KAPSULE_REGISTRATION` explicite fait foi (`closed` ferme, tout autre
   *   valeur ouvre).
   * - Sans variable : ouverte en dev, FERMEE par defaut en production, pour
   *   qu'une erreur de configuration n'expose pas la creation de comptes
   *   (audit 2026-07-18, AC4).
   */
  registrationOpen() {
    const v = process.env.KAPSULE_REGISTRATION;
    if (v != null && v !== "") return v.toLowerCase() !== "closed";
    return process.env.NODE_ENV !== "production";
  }

  countUsers() {
    return this.db.prepare(`SELECT COUNT(*) AS n FROM users`).get().n;
  }

  getUserById(id) {
    return (
      this.db.prepare(`SELECT id, email, role, created_at FROM users WHERE id = ?`).get(id) ?? null
    );
  }

  /**
   * Cree un compte. Le tout premier compte herite de la progression `default`
   * (migration MVP -> multi-utilisateurs).
   * @returns {{ ok: true, user: any } | { ok: false, error: string, status: number }}
   */
  async register(email, password) {
    const mail = normalizeEmail(email);
    if (!EMAIL_RE.test(mail)) {
      return { ok: false, status: 422, error: "email invalide" };
    }
    if (typeof password !== "string" || password.length < 8) {
      return { ok: false, status: 422, error: "mot de passe trop court (8 caracteres minimum)" };
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return {
        ok: false,
        status: 422,
        error: `mot de passe trop long (${MAX_PASSWORD_LENGTH} caracteres maximum)`,
      };
    }
    const exists = this.db.prepare(`SELECT 1 FROM users WHERE email = ?`).get(mail);
    if (exists) {
      return { ok: false, status: 409, error: "un compte existe deja avec cet email" };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const isFirst = this.countUsers() === 0;
    // Hachage hors transaction (scrypt async ne peut pas vivre dans une
    // transaction better-sqlite3, qui est synchrone).
    const passwordHash = await hashPassword(password);

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`)
        .run(id, mail, passwordHash, now);
      // Migration : rattacher la progression `default` au premier compte cree.
      if (isFirst) {
        this.db.prepare(`UPDATE progress SET user_id = ? WHERE user_id = ?`).run(id, DEFAULT_USER);
      }
    });
    tx();

    // Tout nouveau compte est invite (role par defaut en base).
    return { ok: true, user: { id, email: mail, role: "guest", created_at: now } };
  }

  /**
   * Authentifie et ouvre une session pour cet appareil.
   * @returns {{ ok: true, token: string, user: any } | { ok: false, error: string }}
   */
  async login(email, password, userAgent = null) {
    const mail = normalizeEmail(email);
    // Borne l'entree avant tout hachage (anti-DoS) ; on ne divulgue pas la
    // raison exacte de l'echec.
    if (typeof password !== "string" || password.length > MAX_PASSWORD_LENGTH) {
      return { ok: false, error: "email ou mot de passe incorrect" };
    }
    const row = this.db
      .prepare(`SELECT id, email, role, password_hash, created_at FROM users WHERE email = ?`)
      .get(mail);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return { ok: false, error: "email ou mot de passe incorrect" };
    }
    // Purge opportuniste des sessions expirees a chaque connexion.
    this.purgeExpiredSessions();
    const token = this.createSession(row.id, userAgent);
    return {
      ok: true,
      token,
      user: { id: row.id, email: row.email, role: row.role, created_at: row.created_at },
    };
  }

  createSession(userId, userAgent = null) {
    const token = randomBytes(32).toString("hex");
    const now = new Date();
    const expires = new Date(now.getTime() + SESSION_DAYS * 86400_000);
    this.db
      .prepare(
        `INSERT INTO sessions (token, user_id, created_at, last_used_at, expires_at, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        hashSessionToken(token),
        userId,
        now.toISOString(),
        now.toISOString(),
        expires.toISOString(),
        userAgent,
      );
    return token;
  }

  /**
   * Resout un token en utilisateur. Prolonge la session a l'usage, mais
   * n'ecrit en base qu'au-dela de SESSION_REFRESH_MS depuis la derniere
   * activite (reduction des ecritures, ADR 003 / AC10). Renvoie null si absent
   * ou expire (session alors purgee).
   */
  getSessionUser(token) {
    if (!token) return null;
    const s = this.db
      .prepare(`SELECT token, user_id, expires_at, last_used_at FROM sessions WHERE token = ?`)
      .get(hashSessionToken(token));
    if (!s) return null;
    const now = new Date();
    if (new Date(s.expires_at) <= now) {
      this.deleteSession(token);
      return null;
    }
    if (now.getTime() - new Date(s.last_used_at).getTime() >= SESSION_REFRESH_MS) {
      const expires = new Date(now.getTime() + SESSION_DAYS * 86400_000);
      this.db
        .prepare(`UPDATE sessions SET last_used_at = ?, expires_at = ? WHERE token = ?`)
        .run(now.toISOString(), expires.toISOString(), s.token);
    }
    return this.getUserById(s.user_id);
  }

  deleteSession(token) {
    return (
      this.db.prepare(`DELETE FROM sessions WHERE token = ?`).run(hashSessionToken(token)).changes >
      0
    );
  }

  /** Supprime les sessions expirees. Renvoie le nombre de lignes purgees. */
  purgeExpiredSessions() {
    return this.db
      .prepare(`DELETE FROM sessions WHERE expires_at <= ?`)
      .run(new Date().toISOString()).changes;
  }
}
