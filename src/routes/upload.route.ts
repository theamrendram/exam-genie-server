import { Router } from "express";
import { getPDFsByUserId, uploadPDF } from "../controllers/upload.controller";

const router = Router();

router.post("/pdfs", uploadPDF);
router.get("/pdfs", getPDFsByUserId);

export default router;
