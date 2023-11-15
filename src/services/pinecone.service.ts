import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Pinecone, QueryOptions } from "@pinecone-database/pinecone";
import { IVectorStoreService } from "./interfaces/vectorStore.service.interface";
import { Document } from "langchain/dist/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { DeleteOperationRequest, QueryOperationRequest } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

export class PineConeService implements IVectorStoreService {
    constructor() {
    }

    async saveData(docs: Document<Record<string, string>>[], indexName: string, classId: string): Promise<void> {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_AI_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!
        });

        const index = client.Index(indexName);

        await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
            pineconeIndex: index,
            namespace: classId
        });
    }

    async queryIndex(indexName: string, classId: string, prompt: number[], topK: number = 5) {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_AI_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!
        });

        const queryRequest: QueryOptions = {
            topK: topK,
            includeValues: true,
            includeMetadata: true,
            vector: prompt
        };
        
        const response = await client.Index(process.env.PINECONE_INDEX_NAME!).namespace(classId).query(queryRequest);

        console.log("response from pinecone: ", response);

        return response.matches;
    }

    async getVectorStore(classId: string) {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_AI_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!
        });

        const index = client.Index(process.env.PINECONE_INDEX_NAME!)
        console.log("classId: ", classId);
        const store = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({
                openAIApiKey: process.env.OPENAI_API_KEY
            }),
            {
                pineconeIndex: index,
                namespace: classId
            }
          );
          
        return store;
    }

    async deleteClassData(indexName: string, classId: string) : Promise<boolean> {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_AI_API_KEY!,
            environment: process.env.PINECONE_ENVIRONMENT!
        });


        const deleteOperationRequest: DeleteOperationRequest = {
            deleteRequest: 
            {
                namespace: classId,
                deleteAll: true
            }
        };

        try {
            const response = await client.Index(indexName).deleteMany(deleteOperationRequest);
            return true;
        } catch (error) {
            console.log(error);
        }
        
        return false;
    }
}