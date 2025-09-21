import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Worker } from "bullmq";

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "text-embedding-004",
  apiKey: process.env.GEMINI_API_KEY,
});

const worker = new Worker(
  "pdf-upload-queue",
  async (job) => {
    try {
      const { filename, path } = job.data;
      console.log("Processing job:", job.id, "filename:", filename);
      console.log("path:", path);

      const loader = new PDFLoader(path);
      const docs = await loader.load();
      console.log("Loaded documents:", docs.length);

      // TODO: Add PDF processing logic here
      // 1. Chunk the documents
      // 2. Generate embeddings
      // 3. Store in Qdrant

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const chunks = await splitter.splitDocuments(docs);
      console.log("Chunks:", chunks.length);

      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "pdf-embeddings",
      });

      const chunksWithMetadata = chunks.map((chunk) => {
        return new Document({
          pageContent: chunk.pageContent,
          metadata: {
            ...chunk.metadata,
            filename,
            source: path,
          },
        });
      });

      await vectorStore.addDocuments(chunksWithMetadata);
      console.log("Documents added to vector store");
    } catch (error) {
      console.error("Error processing job:", job.id, error);
      throw error; // Re-throw to mark job as failed
    }
  },
  {
    concurrency: 100,
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
);

// Add event listeners
worker.on("ready", () => {
  console.log("Worker is ready and listening for jobs");
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

worker.on("failed", (job, error) => {
  console.error("Job failed:", job?.id, error);
});

worker.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

console.log("Worker initialized and ready to process jobs");
