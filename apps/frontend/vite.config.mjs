import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Cible de l'API backend en dev (proxy) et pour le service worker.
const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:3001";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "Kapsule",
        short_name: "Kapsule",
        description: "Fiches de connaissance courtes en decks.",
        theme_color: "#23566b",
        background_color: "#14181b",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // P0 isolation inter-comptes (cf. audit 2026-07-18) : le cache runtime
        // des API authentifiees est DESACTIVE. L'ancien NetworkFirst mettait en
        // cache /api/decks par URL seule, sans segmentation par utilisateur ni
        // purge au logout ; hors ligne, un compte B pouvait recevoir les decks
        // du compte A sur le meme navigateur. On force donc NetworkOnly sur
        // /api : aucune reponse authentifiee ne transite par le cache.
        // Le retour d'un cache segmente + purge a login/logout est suivi par une
        // ADR (cache/session) avant reactivation de la lecture hors ligne.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
});
