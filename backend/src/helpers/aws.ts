import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});


export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "ap-south-1",
});
