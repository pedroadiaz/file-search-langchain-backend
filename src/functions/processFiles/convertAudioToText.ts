import { Context, S3Event } from "aws-lambda";
import { S3AudioLoader } from "../../services/s3-audio.service";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineConeService } from "@services/pinecone.service";

export const handler = async (event: S3Event, context: Context) => {
    await Promise.all(event.Records.map(async (rec) => {
        const bucket = rec.s3.bucket.name;
        const key = rec.s3.object.key;

        const classId = key.split("/")?.[0];

        const loader = new S3AudioLoader({
            bucket: bucket,
            key: key, 
            unstructuredAPIURL: process.env.UNSTRUCTURED_API_URL,
            unstructuredAPIKey: process.env.UNSTRUCTURED_API_KEY,
        });

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 0
        });

        const doc = await loader.load();

        const newDocs = await splitter.splitDocuments(doc);

        try {
            if (newDocs.length > 0) {
                for (let i=0;i<newDocs.length;i++) {
                    newDocs[i].metadata = {
                        fileName: key.split("/")?.[1]
                    }
                    if (i<20){
                        console.log(`content for index ${i}`, newDocs[i]?.pageContent);
                        console.log(`metadata for index ${i}`, newDocs[i]?.metadata);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }

        const service = new PineConeService();

        await service.saveData(newDocs, process.env.PINECONE_INDEX_NAME, classId);
    }));
}