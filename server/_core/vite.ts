import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";

export async function setupVite(app: Express, server: Server) {
  const vite = await import("vite");
  const viteServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(viteServer.middlewares);

  app.use("*", async (req, res, next) => {
    if (req.method !== "GET") return next();
    const url = req.originalUrl;
    try {
      const template = await viteServer.transformIndexHtml(
        url,
        fs.readFileSync(path.resolve("client/index.html"), "utf-8")
      );
      const page = await viteServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      viteServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the dist folder is at the project root
  // Handle both development and production paths
  let projectRoot: string;
  
  if (process.env.NODE_ENV === "production") {
    // On Render, the app runs from /opt/render/project/src
    // We need to figure out the correct path to dist
    // Use import.meta.url to get the current file location
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    // Go up from server/_core/ to project root
    projectRoot = path.resolve(currentDir, "../..");
  } else {
    projectRoot = path.resolve(import.meta.dirname, "../..");
  }
  
  const distPath = path.join(projectRoot, "dist", "public");

  // List what's in the project root for debugging
  console.log(`[serveStatic] Project root: ${projectRoot}`);
  console.log(`[serveStatic] Looking for static files at: ${distPath}`);
  console.log(`[serveStatic] distPath exists: ${fs.existsSync(distPath)}`);

  // Check what's in the dist folder
  if (fs.existsSync(projectRoot)) {
    const distRoot = path.join(projectRoot, "dist");
    if (fs.existsSync(distRoot)) {
      console.log(`[serveStatic] Contents of dist/:`, fs.readdirSync(distRoot));
    } else {
      console.log(`[serveStatic] No dist/ folder at project root`);
    }
  }

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`[serveStatic] Sending index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
}

