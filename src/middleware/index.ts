import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from 'compression';
import cors from "cors";
import morgan from "morgan";

export const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://localhost:5173"],
  allowedHeaders: ["Content-Type"],
});

export const morganMiddleware = morgan("tiny");
export const compressionMiddleware = compression({ level: 5 });
export const expressJsonMiddleware = express.json();
export const urlencodedMiddleware = express.urlencoded({ extended: true });
export const helmetMiddleware = helmet();
