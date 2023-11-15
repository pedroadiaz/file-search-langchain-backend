import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineConeService } from "@services/pinecone.service";
import { formatJSONResponse } from '@libs/api-gateway';
import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "@libs/urlLoader";

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return formatJSONResponse({
            message: `Body must not be empty.`,
        },
        400); 
    }
    const body = JSON.parse(event.body);

    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

    const loader = new RecursiveUrlLoader(
        body.url, 
        {
            extractor: compiledConvert,
            maxDepth: 0,
            preventOutside: true,
        }
    );

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 0
    });

    const doc = await loader.load();

    console.log("document: ", doc);

    const newDocs = await splitter.splitDocuments(doc);

    const service = new PineConeService();

    await service.saveData(newDocs, process.env.PINECONE_INDEX_NAME, body.classId);
    
    return formatJSONResponse({
        message: `URL successfully added to the module.`,
    }); 
}