import { Document } from "langchain/dist/document";

export interface IVectorStoreService {
    saveData(docs: Document<Record<string, string>>[], indexName: string, classId: string): Promise<void>;
}