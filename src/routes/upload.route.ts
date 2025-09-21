import { uploadController } from "../controllers/upload.controller";
import { Router } from "express";

const router = Router();

router.post("/pdf", uploadController);

export default router;  