import express, { Router } from "express";
import { handleWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/clerk", express.raw({ type: "application/json" }), handleWebhook);
router.get("/clerk", async (req, res) => {
  res.status(200).json({ message: "Webhook received" });
});

export default router;