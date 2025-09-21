import { Router } from "express";
import { uploadPDF, getPDFsByUserId } from "../controllers/upload.controller";

const router = Router();

router.post("/pdfs", uploadPDF);
router.get("/pdfs", getPDFsByUserId);

export default router;
