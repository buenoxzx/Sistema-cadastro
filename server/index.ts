import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
const httpServer = createServer(app);

/* =======================
   Middlewares básicos
======================= */

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

/* =======================
   Logger utilitário
======================= */

function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("pt-BR");
  console.log(`[${time}] [${source}] ${message}`);
}

/* =======================
   Logger de requisições
======================= */

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
});

/* =======================
   Rotas
======================= */

(async () => {
  // Rotas da API
  await registerRoutes(httpServer, app);

  // Health check (IMPORTANTE)
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  /* =======================
     Error handler
  ======================= */

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
      message: err.message || "Internal Server Error",
    });
  });

  /* =======================
     Start server
  ======================= */

  const port = Number(process.env.PORT) || 5000;

  httpServer.listen(port, "0.0.0.0", () => {
    log(`API running on port ${port}`);
  });
})();
