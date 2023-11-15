import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineConeService } from "@services/pinecone.service";
import { formatJSONResponse } from '@libs/api-gateway';
import { YoutubeTranscript } from "youtube-transcript";
import { Document, DocumentInput } from "langchain/document";

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return formatJSONResponse({
            message: `Body must not be empty.`,
        },
        400); 
    }
    const body = JSON.parse(event.body);

    // const loader = YoutubeLoader.createFromUrl(body.url, {
    //     language: "en",
    //     addVideoInfo: true,
    //   });

    const transcript = await YoutubeTranscript.fetchTranscript(body.url);

    const documents = transcript.map(tr => {
        const input: DocumentInput = {
            pageContent: tr.text,
            metadata: {
                duration: tr.duration,
                offset: tr.offset
            }
        }
        const doc = new Document(input);
        return doc;
    });      

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0
    });

    const newDocs = await splitter.splitDocuments(documents);
    
    const service = new PineConeService();

    await service.saveData(newDocs, process.env.PINECONE_INDEX_NAME, body.classId);
    
    return formatJSONResponse({
        message: `YouTube video successfully transcribed.`,
    }); 
}