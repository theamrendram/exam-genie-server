import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function retrieveData(query: string, k: number = 5) {
  try {
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "pdf-embeddings",
    });
    const results = vectorStore.asRetriever({
      k,
    });
    const result = await results.invoke(query);
    return result;
  } catch (error) {
    console.error("Error in retrieveData:", error);
    throw error;
  }
}
