import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateContent(userInput: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userInput,
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
