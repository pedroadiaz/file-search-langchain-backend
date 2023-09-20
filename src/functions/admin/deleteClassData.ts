import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { PineConeService } from "@services/pinecone.service";
import { formatJSONResponse } from '@libs/api-gateway';

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> =>  {
    const classId = event.pathParameters.classId;
    const service = new PineConeService();
    const result = await service.deleteClassData(process.env.PINECONE_INDEX_NAME, classId);

    return formatJSONResponse({
        results: result
    }, 200);
}