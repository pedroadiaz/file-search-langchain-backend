import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { PineConeService } from "@services/pinecone.service";
import { formatJSONResponse } from '@libs/api-gateway';
import { OpenAIService } from '@services/openAI.service';

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> =>  {
    const body = JSON.parse(event.body);
    const service = new PineConeService();
    const embeddingService = new OpenAIService();
    const embeddings = await embeddingService.getEmbeddings(body.prompt);
    const result = await service.queryIndex(process.env.PINECONE_INDEX_NAME, body.classId, embeddings);

    return formatJSONResponse({
        results: result
    }, 200);
}