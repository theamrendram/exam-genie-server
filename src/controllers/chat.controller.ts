import { Request, RequestHandler } from "express";
import generateContent from "../generate";
import prisma from "../utils/prisma-client";
import retrieveData from "../utils/retrieve-data";

interface RequestWithAuth extends Request {
  auth: any;
}

const sendMessage: RequestHandler = async (req, res) => {
  const { message, conversationId } = req.body as { message: string; conversationId: number };
  const userId = (req as RequestWithAuth).auth().userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required" });
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Save user message to database
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        sender: "USER",
        conversationId: conversationId,
        userId: userId,
      },
    });

    // Retrieve relevant context from vector store
    const contextResults = await retrieveData(message, 5);
    const context = contextResults.map((result: any) => result.pageContent).join("\n\n");

    // Fetch complete conversation history
    const chatHistory = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        content: true,
        sender: true,
        createdAt: true,
      },
    });

    // Generate response with context and chat history
    const response = await generateContent(message, context, chatHistory);

    // Save assistant message to database
    const assistantMessage = await prisma.message.create({
      data: {
        content: response,
        sender: "ASSISTANT",
        conversationId: conversationId,
        userId: userId,
      },
    });

    res.json({
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        sender: userMessage.sender,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        content: assistantMessage.content,
        sender: assistantMessage.sender,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getConversation: RequestHandler = async (req, res) => {
  const { conversationId } = req.params;
  const userId = (req as RequestWithAuth).auth().userId;
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages.map((message: any) => ({
          id: message.id,
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getConversations: RequestHandler = async (req, res) => {
  const userId = (req as RequestWithAuth).auth().userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
        isArchived: false,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessage: conversation.messages[0]?.content || "",
      })),
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { sendMessage, getConversation, getConversations };
