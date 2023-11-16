export const queryFunctions = {
    query: {
        handler: './src/functions/query/queryIndex.handler',
        events: [
            {
                http: {
                    method: 'post',
                    path: 'query',
                    cors: {
                      origin: "*",
                      headers: [
                        "Accept",
                        "Content-Type",
                        "Content-Length",
                        "Authorization"
                      ]
                    }
                }
            }
        ]
    },
    getEmbeddings: {
        handler: './src/functions/query/getEmbeddings.handler',
        events: [
            { 
                http: {
                    method: 'get',
                    path: 'query',
                    cors: {
                      origin: "*",
                      headers: [
                        "Accept",
                        "Content-Type",
                        "Content-Length",
                        "Authorization"
                      ]
                    }
                }
            }
        ]
    },
    qanda: {
        handler: './src/functions/query/question-answer.handler',
        timeout: 15,
        events: [
            {
                http: {
                    method: 'post',
                    path: 'qanda',
                    cors: {
                      origin: "*",
                      headers: [
                        "Accept",
                        "Content-Type",
                        "Content-Length",
                        "Authorization"
                      ]
                    }
                }
            }
        ]
    },
}