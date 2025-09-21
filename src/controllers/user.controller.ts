import { RequestHandler } from "express";
import prisma from "../utils/prisma-client";

interface RequestWithAuth extends Request {
  auth: any;
}

// Get all users (Admin only)
const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
            conversations: true,
            PDFs: true,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
            conversations: true,
            PDFs: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user profile
const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
            conversations: true,
            PDFs: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new user
const createUser: RequestHandler = async (req, res) => {
  try {
    const { email, name, imageUrl, role = "USER" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        imageUrl,
        role: role as "USER" | "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Sync user from Clerk (for webhook or manual sync)
const syncUserFromClerk: RequestHandler = async (req, res) => {
  try {
    const { email, name, imageUrl, clerkId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: name || existingUser.name,
          imageUrl: imageUrl || existingUser.imageUrl,
        },
        select: {
          id: true,
          email: true,
          name: true,
          imageUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.json({ message: "User updated", user: updatedUser });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        imageUrl,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({ message: "User created", user });
  } catch (error) {
    console.error("Error syncing user from Clerk:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user
const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { name, imageUrl, role } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (role !== undefined) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update current user profile
const updateCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;
    const { name, imageUrl } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Error updating current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user
const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's conversations
const getUserConversations: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's messages
const getUserMessages: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;
    const { conversationId } = req.query;

    const whereClause: any = { userId };
    if (conversationId) {
      whereClause.conversationId = parseInt(conversationId as string);
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        conversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's PDFs
const getUserPDFs: RequestHandler = async (req, res) => {
  try {
    const userId = (req as unknown as RequestWithAuth).auth().userId;

    const pdfs = await prisma.uploadedPDF.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(pdfs);
  } catch (error) {
    console.error("Error fetching user PDFs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getAllUsers,
  getUserById,
  getCurrentUser,
  createUser,
  syncUserFromClerk,
  updateUser,
  updateCurrentUser,
  deleteUser,
  getUserConversations,
  getUserMessages,
  getUserPDFs,
};
