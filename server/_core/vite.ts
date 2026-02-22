import express, { Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "http";

export async function setupVite(app: Express, server: Server) {
  const vite = await import("vite");
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

  // Admin Vite (back office) — root = dossier admin
  const adminRoot = path.join(projectRoot, "admin");
  const adminViteServer = await vite.createServer({
    configFile: path.join(adminRoot, "vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use("/admin", async (req, res, next) => {
    const urlPath = req.originalUrl.replace(/^\/admin\/?/, "/") || "/";
    const isLikelyHtmlRequest =
      req.method === "GET" &&
      (urlPath === "/" ||
        urlPath === "" ||
        (!urlPath.startsWith("/@") &&
          !urlPath.startsWith("@") &&
          !urlPath.includes(".")));

    if (isLikelyHtmlRequest) {
      try {
        const template = fs.readFileSync(path.join(adminRoot, "index.html"), "utf-8");
        // Passer "/" pour que Vite injecte le script en /src/main.tsx (module id cohérent)
        const rawHtml = await adminViteServer.transformIndexHtml("/", template);
        // Réécrire les chemins /src/ et /@vite/ en /admin/src/ et /admin/@vite/ pour que le navigateur demande /admin/...
        const html = rawHtml
          .replace(/(src|href)="(\/src\/)/g, '$1="/admin/src/')
          .replace(/(src|href)="(\/@vite\/)/g, '$1="/admin/@vite/');
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        adminViteServer.ssrFixStacktrace(e as Error);
        next(e);
      }
      return;
    }

    // Passer à Vite le chemin SANS /admin (root = admin/) pour résoudre admin/src/main.tsx
    const originalUrl = req.url;
    req.url = urlPath;
    adminViteServer.middlewares(req, res, () => {
      req.url = originalUrl;
      next();
    });
  });

  // Client Vite (front office)
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(viteServer.middlewares);

  // En mode middleware Vite ne sert pas index.html : fallback SPA pour le client (GET /, /produits, etc.)
  app.use("*", async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.originalUrl.startsWith("/admin")) return next();
    try {
      const template = fs.readFileSync(path.join(projectRoot, "client", "index.html"), "utf-8");
      const html = await viteServer.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

function getProjectRoot(): string {
  if (process.env.NODE_ENV === "production") {
    // En prod, la commande start est lancée depuis la racine du dépôt (Render, Railway, etc.)
    const cwd = process.cwd();
    const fromCwd = path.join(cwd, "dist", "public");
    if (fs.existsSync(fromCwd)) return cwd;
    // Fallback : racine déduite depuis l'emplacement du bundle (dist/index.js)
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(currentDir, "..");
  }
  return path.resolve(import.meta.dirname, "../..");
}

export function serveStatic(app: Express) {
  const projectRoot = getProjectRoot();
  // IMPORTANT: ne servir que dist/public (client), jamais dist/ (contient index.js = bundle serveur)
  const distDir = path.join(projectRoot, "dist");
  const distPath = path.join(distDir, "public");
  const distAdminPath = path.join(distDir, "admin");
  const serverBundlePath = path.join(distDir, "index.js");

  const distPathExists = fs.existsSync(distPath);
  const indexHtmlPath = path.join(distPath, "index.html");
  const indexHtmlExists = distPathExists && fs.existsSync(indexHtmlPath);

  console.log(`[serveStatic] Project root: ${projectRoot}`);
  console.log(`[serveStatic] dist/public exists: ${distPathExists}`);
  console.log(`[serveStatic] dist/public/index.html exists: ${indexHtmlExists}`);
  if (fs.existsSync(serverBundlePath)) {
    console.log(`[serveStatic] Server bundle at ${serverBundlePath} (must NOT be served to browser)`);
  }

  // Fichiers uploadés (produits, bannières, paramètres)
  const uploadsPath = path.join(projectRoot, "uploads");
  if (fs.existsSync(uploadsPath)) {
    app.use("/uploads", express.static(uploadsPath));
  }

  // Back office (admin) : servir les fichiers statiques sous /admin puis SPA
  if (fs.existsSync(distAdminPath)) {
    app.use("/admin", express.static(distAdminPath, { index: false }));
    app.get(["/admin", "/admin/*"], (_req, res) => {
      res.sendFile(path.join(distAdminPath, "index.html"));
    });
  } else {
    console.log(`[serveStatic] No dist/admin/ folder, back office will not be available`);
  }

  // Ne servir le client que si dist/public ET dist/public/index.html existent (jamais dist/ qui contient index.js)
  const expectedPublicPath = path.join(projectRoot, "dist", "public");
  const safeToServeClient =
    distPathExists &&
    indexHtmlExists &&
    path.normalize(distPath) === path.normalize(expectedPublicPath);
  if (!safeToServeClient) {
    console.error(
      `Could not find the client build at ${distPath} (index.html: ${indexHtmlExists}). Make sure to run the full build (client + admin + server).`
    );
    app.use("*", (_req, res) => {
      res.status(503).set("Content-Type", "text/html; charset=utf-8").end(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Maintenance</title></head><body style="font-family:sans-serif;padding:2rem;max-width:40rem;margin:0 auto;"><h1>Site en cours de déploiement</h1><p>Le client (front) n’a pas été compilé. Vérifiez que la commande de build inclut <code>pnpm run build</code> et que le <strong>Root Directory</strong> est la racine du dépôt.</p><p>Attendu&nbsp;: <code>dist/public/index.html</code>.</p></body></html>`
      );
    });
    return;
  }

  // Servir uniquement dist/public (jamais dist/ pour éviter d’exposer dist/index.js)
  app.use(express.static(distPath, { fallthrough: true }));

  // Fallback SPA : envoyer uniquement le fichier index.html du client (dist/public/index.html)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/admin") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(indexHtmlPath);
  });
}

