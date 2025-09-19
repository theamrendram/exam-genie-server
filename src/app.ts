import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import generateContentController from "./routes/generate.route";
import { clerkMiddleware, requireAuth } from "@clerk/express";
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api/generate", requireAuth(), generateContentController);

app.get("/", (req, res) => {
  res.send("server is running...");
});

export default app;
