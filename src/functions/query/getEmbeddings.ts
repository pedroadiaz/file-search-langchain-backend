import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { OpenAIService } from "@services/openAI.service";
import { formatJSONResponse } from '@libs/api-gateway';

export const handler = async (event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> =>  {
    const prompt = event.queryStringParameters.prompt;
    console.log("parameters: ", event.queryStringParameters);
    const service = new OpenAIService();
    const result = await service.getEmbeddings(prompt);

    return formatJSONResponse({
        results: result
    }, 200);
}