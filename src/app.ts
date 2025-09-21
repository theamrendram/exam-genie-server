import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import generateContentController from "./routes/generate.route";
import uploadController from "./routes/upload.route";


const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api/generate", requireAuth(), generateContentController);
app.use("/api/upload", multer().single("file"), uploadController);
app.get("/", (req, res) => {
  res.send("server is running...");
});

export default app;
