import { Document } from "langchain/dist/document";

export interface IVectorStoreService {
    createIndex(indexName: string): Promise<void>;
    saveData(docs: Document<Record<string, string>>[], indexName: string, classId: string): Promise<void>;
}