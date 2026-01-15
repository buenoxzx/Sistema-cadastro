import { fileURLToPath } from "url";
import path from "path";
import express, { type Express } from "express";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  // Se o frontend não existir, não quebra o backend
  if (!fs.existsSync(distPath)) {
    console.warn(
      "[static] Frontend build não encontrado, servindo apenas API."
    );
    return;
  }

  app.use(express.static(distPath));

  // fallback para SPA
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
