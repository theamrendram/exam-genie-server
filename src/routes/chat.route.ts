import { Router } from "express";
import { getConversation, getConversations, sendMessage } from "../controllers/chat.controller";

const router = Router();

router.post("/message", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversation/:conversationId", getConversation);

export default router;
