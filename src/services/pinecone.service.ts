import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient, CreateRequest } from "@pinecone-database/pinecone";
import { IVectorStoreService } from "./interfaces/vectorStore.service.interface";
import { Document } from "langchain/dist/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { QueryOperationRequest } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

export class PineConeService implements IVectorStoreService {
    constructor() {
    }
    async createIndex(indexName: string): Promise<void> {
        const client = new PineconeClient();
        await client.init({
            apiKey: process.env.PINECONE_AI_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT
        });

        const params: CreateRequest = {
            name: indexName,
            dimension: 1536,
            metric: "cosine",
            podType: "p1"
        };

        console.log("create request: ", params);
        const reponse = await client.createIndex({
            createRequest: params
        });

        console.log("response from create index call: ", reponse);
    }

    async saveData(docs: Document<Record<string, string>>[], indexName: string, classId: string): Promise<void> {
        const client = new PineconeClient();
        await client.init({
            apiKey: process.env.PINECONE_AI_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT
        });

        const index = client.Index(indexName);

        await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
            pineconeIndex: index,
            namespace: classId
        });
    }

    async queryIndex(indexName: string, classId: string, prompt: number[]) {
        const client = new PineconeClient();
        await client.init({
            apiKey: process.env.PINECONE_AI_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT
        });

        const queryRequest: QueryOperationRequest = {
            queryRequest: 
            {
                topK: 5,
                includeValues: true,
                includeMetadata: true,
                vector: prompt,
                namespace: classId
            }
        };
        
        const response = await client.Index(indexName).query(queryRequest);

        return response.matches;
    }
}