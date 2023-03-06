import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

export const corsMiddleware = cors({
  origin: ["http://localhost:5173", "https://localhost:5173", "https://jitchat.oriolgomez.com"],
  allowedHeaders: ["Content-Type"],
});

export const morganMiddleware = morgan("tiny");
export const expressJsonMiddleware = express.json();
export const urlencodedMiddleware = express.urlencoded({ extended: true });
export const helmetMiddleware = helmet({
  noSniff: true,
});
