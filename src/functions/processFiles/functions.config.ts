export const processFilesFunctions = {
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
    },
    convertUrlLambda: {
      handler: './src/functions/processFiles/convertUrlToText.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'convertUrlLambda',
            cors: {
              origin: "*",
              headers: [
                "Accept",
                "Content-Type",
                "Content-Length",
                "Authorization"
              ]
            }
          },
        },
      ]
    },
    convertYoutubeLambda: {
      handler: './src/functions/processFiles/convertYouTubeToText.handler',
      events: [
        {
          http: {
            method: 'post',
            path: 'youtube',
            cors: {
              origin: "*",
              headers: [
                "Accept",
                "Content-Type",
                "Content-Length",
                "Authorization"
              ]
            }
          },
        },
      ]
    },
}