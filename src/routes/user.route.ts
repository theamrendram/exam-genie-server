import { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  getUserById,
  getUserConversations,
  getUserMessages,
  getUserPDFs,
  syncUserFromClerk,
  updateCurrentUser,
  updateUser,
} from "../controllers/user.controller";
import requireAdmin from "../middleware/admin.middleware";

const router = Router();

// Public routes (no auth required)
router.post("/", createUser);
router.post("/sync", syncUserFromClerk);

// Protected routes (require authentication)
router.get("/me", requireAuth(), getCurrentUser);
router.put("/me", requireAuth(), updateCurrentUser);
router.get("/me/conversations", requireAuth(), getUserConversations);
router.get("/me/messages", requireAuth(), getUserMessages);
router.get("/me/pdfs", requireAuth(), getUserPDFs);

// Admin routes (require authentication and admin role)
router.get("/", requireAuth(), requireAdmin, getAllUsers);
router.get("/:id", requireAuth(), requireAdmin, getUserById);
router.put("/:id", requireAuth(), requireAdmin, updateUser);
router.delete("/:id", requireAuth(), requireAdmin, deleteUser);

export default router;
