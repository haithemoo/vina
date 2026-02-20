import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
Error: ENOENT: no such file or directory, stat '/opt/render/project/dist/public/index.html'
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the dist folder is at the project root
  // Since this file is at server/_core/vite.ts, we need to go up 2 levels
  const projectRoot = path.resolve(import.meta.dirname, "../..");
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
