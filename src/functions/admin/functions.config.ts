export const adminFunctions = {
    deleteClassData: {
        handler: './src/functions/admin/deleteClassData.handler',
        events: [
            {
                http: {
                    method: 'delete',
                    path: 'pinecone/deleteClass/{classId}',
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