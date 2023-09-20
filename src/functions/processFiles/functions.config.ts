export const processFilesFunctions = {
    createIndex: {
        handler: './src/functions/processFiles/createPineconeIndex.handler',
        events: [
            {
                http: {
                    method: 'post',
                    path: 'pinecone/createIndex',
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
    convertPDFToText: {
        handler: './src/functions/processFiles/convertPDFToText.handler',
        timeout: 120,
        events: [
            { 
                s3: {
                    bucket: "file-search-bucket-${opt:stage}",
                    event: "s3:ObjectCreated:*",
                    rules: [
                        {
                            suffix: ".pdf"
                        }
                    ]
                }
            }
        ]
    },
    convertAudioToText: {
        handler: './src/functions/processFiles/convertAudioToText.handler',
        timeout: 120,
        events: [
            { 
                s3: {
                    bucket: "file-search-bucket-${opt:stage}",
                    event: "s3:ObjectCreated:*",
                    rules: [
                        {
                            suffix: ".mp3"
                        }
                    ]
                }
            }
        ]
    },
    processTextFile: {
        handler: './src/functions/processFiles/processTextFile.handler',
        timeout: 120,
        events: [
            { 
                s3: {
                    bucket: "file-search-bucket-${opt:stage}",
                    event: "s3:ObjectCreated:*",
                    rules: [
                        {
                            suffix: ".txt"
                        }
                    ]
                }
            }
        ]
    }
}