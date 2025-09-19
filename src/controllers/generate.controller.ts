import { Request, RequestHandler } from "express";
import generateContent, { generateConversationTitle } from "../generate";
import prisma from "../utils/prisma-client";

interface RequestWithAuth extends Request {
  auth: any;
}

const generateContentController: RequestHandler = async (req, res) => {
  const { message } = req.body as { message: string };
  console.dir((req as RequestWithAuth).auth, { depth: null });

  const response = await generateContent(message);
  res.json({ response: response });
};

const startConversation: RequestHandler = async (req, res) => {
  const { message } = req.body as { message: string };
  const userId = (req as RequestWithAuth).auth?.userId;

  const [response, title] = await Promise.all([
    generateContent(message),
    generateConversationTitle(message),
  ]);

  const conversation = await prisma.conversation.create({
    data: {
      title,
      user: {
        connect: { id: userId },
      },
    },
  });

  res.json({ response, title, conversationId: conversation.id });
};

export { generateContentController, startConversation };
