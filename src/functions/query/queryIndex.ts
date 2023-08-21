import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { PineConeService } from "@services/pinecone.service";
import { formatJSONResponse } from '@libs/api-gateway';

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> =>  {
    const body = JSON.parse(event.body);
    const service = new PineConeService();
    const result = await service.queryIndex(process.env.PINECONE_INDEX_NAME, body.indexName, body.prompt);

    return formatJSONResponse({
        results: result
    }, 200);
}