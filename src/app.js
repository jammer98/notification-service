import express from "express";
import helmet from "helmet";
import cors from "cors";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import { AppError } from "./utils/AppError.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";

const app = express();

if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
        origin(origin, cb){
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            cb(new AppError("Origin not allowed by CORS", 403));
        }
    })
  );
  app.use(httpLogger);

  app.use("/api/health",healthRoutes);
  app.use("/api/events",eventRoutes);

  app.use(globalLimiter);
  app.use(express.json({ limit: "16kb" }));

  app.use("/api/auth", authRoutes);


  app.use(notFound);
  app.use(errorHandler);

  export default app;