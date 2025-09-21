import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import generateContentRoutes from "./routes/generate.route";
import uploadRoutes from "./routes/upload.route";
import userRoutes from "./routes/user.route";
import webhookRoutes from "./routes/webhook.route";

dotenv.config();

const app = express();

const storage = multer.memoryStorage();
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: (req, file, callback: multer.FileFilterCallback) => {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
    } else {
      callback(new Error("Only PDF files are allowed!"));
    }
  },
});

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

// Routes
app.use("/api/upload", requireAuth(), upload.single("file"), uploadRoutes);
app.use("/api/generate", requireAuth(), generateContentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/", (req, res) => {
  res.send("server is running...");
});

export default app;
