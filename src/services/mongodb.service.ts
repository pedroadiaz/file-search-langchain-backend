import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { CohereEmbeddings } from "langchain/embeddings/cohere";
import { MongoClient } from "mongodb";
import { IVectorStoreService } from "./interfaces/vectorStore.service.interface";
import { Document } from "langchain/dist/document";

export class MongDBService implements IVectorStoreService {
    createIndex(indexName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async saveData(docs: Document<Record<string, string>>[], indexId: string): Promise<void> {
        const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
        const namespace = "vector-database.text-vector-data";
        const [dbName, collectionName] = namespace.split(".");
        const collection = client.db(dbName).collection(collectionName);
        // docs.map(doc => {
        //     doc.metadata = {
        //         indexId: indexId
        //     };
        // });

        await MongoDBAtlasVectorSearch.fromDocuments(
            docs,
            new CohereEmbeddings(),
            {
                collection,
                indexName: "embeddings-search", // The name of the Atlas search index. Defaults to "default"
                textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
                embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
            }
        );
    }
    
}