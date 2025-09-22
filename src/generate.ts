import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateContent(userInput: string, context?: string): Promise<string> {
  let prompt = userInput;

  if (context) {
    prompt = `Based on the following context from your knowledge base, please answer the user's question. If the context doesn't contain relevant information, please say so and provide a general answer.

Context:
${context}

User Question: ${userInput}

Please provide a helpful and accurate response based on the context provided.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
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
