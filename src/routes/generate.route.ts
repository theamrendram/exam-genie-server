import { Router } from "express";
import { generateContentController, startConversation } from "../controllers/generate.controller";

const router = Router();

router.post("/", generateContentController);
router.post("/start", startConversation);

export default router;
