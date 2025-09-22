import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface ChatMessage {
  content: string;
  sender: "USER" | "ASSISTANT" | "SYSTEM";
  createdAt: Date;
}

async function generateContent(
  userInput: string,
  context?: string,
  chatHistory?: ChatMessage[],
): Promise<string> {
  let prompt = userInput;

  if (context) {
    prompt = `Based on the following context from your knowledge base, please answer the user's question. If the context doesn't contain relevant information, please say so and provide a general answer.

Context:
${context}

User Question: ${userInput}

Please provide a helpful and accurate response based on the context provided.`;
  }

  // Prepare contents array for Gemini API with chat history
  const contents = [];

  // Add chat history if provided
  if (chatHistory && chatHistory.length > 0) {
    for (const message of chatHistory) {
      if (message.sender === "USER") {
        contents.push({
          role: "user",
          parts: [{ text: message.content }],
        });
      } else if (message.sender === "ASSISTANT") {
        contents.push({
          role: "model",
          parts: [{ text: message.content }],
        });
      }
    }
  }

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });
  console.log(response.text);
  return response.text ?? "";
}

async function generateConversationTitle(seedMessage: string): Promise<string> {
  const prompt = `You are naming a chat conversation based on the user's first message.
Return ONLY the title text, no quotes, no punctuation at the end, maximum 6 words, concise and descriptive.
User message: ${seedMessage}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const raw = response.text ?? "New Conversation";
  const title = raw.trim().replace(/^"|"$/g, "").slice(0, 80);
  return title || "New Conversation";
}

export default generateContent;
export { generateConversationTitle };
