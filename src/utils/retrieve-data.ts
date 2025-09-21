import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";

export default async function retrieveData() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "text-embedding-004",
    apiKey: process.env.GEMINI_API_KEY,
  });
  const retrieveData = async (query: string, k: number = 5) => {
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
  };

  return retrieveData;
}
