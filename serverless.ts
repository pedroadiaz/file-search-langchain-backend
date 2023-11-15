import type { AWS } from '@serverless/typescript';
import { queryFunctions } from '@functions/query/functions.config';
import { processFilesFunctions } from '@functions/processFiles/functions.config';
import { adminFunctions } from '@functions/admin/functions.config';

const serverlessConfiguration: AWS = {
  service: 'file-search-langchain-backend',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "s3:*",
          "bedrock:*"
        ],
        Resource: [
          '*',
        ]
      }
    ]
  },
  // import the function via paths
  functions: { 
    ...queryFunctions,
    ...processFilesFunctions,
    ...adminFunctions
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
