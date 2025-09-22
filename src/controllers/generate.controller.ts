import { Request, RequestHandler } from "express";
import generateContent, { generateConversationTitle } from "../generate";
import prisma from "../utils/prisma-client";
import retrieveData from "../utils/retrieve-data";

interface RequestWithAuth extends Request {
  auth: any;
}

const generateContentController: RequestHandler = async (req, res) => {
  const { message } = req.body as { message: string };
  console.dir((req as RequestWithAuth).auth, { depth: null });

  try {
    const response = await generateContent(message);
    res.json({ response: response });
  } catch (error) {
    console.error("Error in generateContentController:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const startConversation: RequestHandler = async (req, res) => {
  const { message } = req.body as { message: string };
  const userId = (req as RequestWithAuth).auth().userId;

  try {
    // Retrieve relevant context from vector store
    const contextResults = await retrieveData(message, 5);
    const context = contextResults.map((result: any) => result.pageContent).join("\n\n");

    const [response, title] = await Promise.all([
      generateContent(message, context, []), // Empty chat history for new conversation
      generateConversationTitle(message),
    ]);

    if (!userId) {
      return res.json({ response, title, conversationId: null });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title,
        user: {
          connect: { id: userId },
        },
        messages: {
          create: [
            {
              content: message,
              sender: "USER",
              userId: userId,
            },
            {
              content: response,
              sender: "ASSISTANT",
              userId: userId,
            },
          ],
        },
      },
    });

    console.log("conversation: ", conversation);
    res.json({ response, title, conversationId: conversation.id });
  } catch (error) {
    console.error("Error in startConversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { generateContentController, startConversation };
