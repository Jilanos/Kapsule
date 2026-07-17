// Adaptateur d'authentification : gestion des comptes et des sessions.
// Hachage scrypt (natif Node, zero dependance), tokens de session opaques
// stockes en base (pas de JWT : revocation simple, aucun secret a gerer).

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;
const SESSION_DAYS = 90;
const DEFAULT_USER = "default";

/** Hache un mot de passe : renvoie "scrypt:<sel hex>:<hash hex>". */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Verifie un mot de passe contre un hash stocke, en temps constant. */
export function verifyPassword(password, stored) {
  const parts = String(stored).split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthStore {
  /** @param {import("better-sqlite3").Database} db */
  constructor(db) {
    this.db = db;
  }

  /** L'inscription est ouverte sauf si KAPSULE_REGISTRATION=closed. */
  registrationOpen() {
    return (process.env.KAPSULE_REGISTRATION ?? "open").toLowerCase() !== "closed";
  }

  countUsers() {
    return this.db.prepare(`SELECT COUNT(*) AS n FROM users`).get().n;
  }

  getUserById(id) {
    return this.db.prepare(`SELECT id, email, created_at FROM users WHERE id = ?`).get(id) ?? null;
  }

  /**
   * Cree un compte. Le tout premier compte herite de la progression `default`
   * (migration MVP -> multi-utilisateurs).
   * @returns {{ ok: true, user: any } | { ok: false, error: string, status: number }}
   */
  register(email, password) {
    const mail = normalizeEmail(email);
    if (!EMAIL_RE.test(mail)) {
      return { ok: false, status: 422, error: "email invalide" };
    }
    if (typeof password !== "string" || password.length < 8) {
      return { ok: false, status: 422, error: "mot de passe trop court (8 caracteres minimum)" };
    }
    const exists = this.db.prepare(`SELECT 1 FROM users WHERE email = ?`).get(mail);
    if (exists) {
      return { ok: false, status: 409, error: "un compte existe deja avec cet email" };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const isFirst = this.countUsers() === 0;

    const tx = this.db.transaction(() => {
      this.db
        .prepare(`INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`)
        .run(id, mail, hashPassword(password), now);
      // Migration : rattacher la progression `default` au premier compte cree.
      if (isFirst) {
        this.db.prepare(`UPDATE progress SET user_id = ? WHERE user_id = ?`).run(id, DEFAULT_USER);
      }
    });
    tx();

    return { ok: true, user: { id, email: mail, created_at: now } };
  }

  /**
   * Authentifie et ouvre une session pour cet appareil.
   * @returns {{ ok: true, token: string, user: any } | { ok: false, error: string }}
   */
  login(email, password, userAgent = null) {
    const mail = normalizeEmail(email);
    const row = this.db
      .prepare(`SELECT id, email, password_hash, created_at FROM users WHERE email = ?`)
      .get(mail);
    if (!row || !verifyPassword(password, row.password_hash)) {
      return { ok: false, error: "email ou mot de passe incorrect" };
    }
    const token = this.createSession(row.id, userAgent);
    return { ok: true, token, user: { id: row.id, email: row.email, created_at: row.created_at } };
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
      .run(token, userId, now.toISOString(), now.toISOString(), expires.toISOString(), userAgent);
    return token;
  }

  /**
   * Resout un token en utilisateur. Rafraichit last_used_at et prolonge la
   * session a l'usage. Renvoie null si absent ou expire (session purgee).
   */
  getSessionUser(token) {
    if (!token) return null;
    const s = this.db
      .prepare(`SELECT token, user_id, expires_at FROM sessions WHERE token = ?`)
      .get(token);
    if (!s) return null;
    const now = new Date();
    if (new Date(s.expires_at) <= now) {
      this.deleteSession(token);
      return null;
    }
    const expires = new Date(now.getTime() + SESSION_DAYS * 86400_000);
    this.db
      .prepare(`UPDATE sessions SET last_used_at = ?, expires_at = ? WHERE token = ?`)
      .run(now.toISOString(), expires.toISOString(), token);
    return this.getUserById(s.user_id);
  }

  deleteSession(token) {
    return this.db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token).changes > 0;
  }
}
