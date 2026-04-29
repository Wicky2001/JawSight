import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// Initialize the SQS Client
// It will automatically use the AWS credentials from your environment variables or ~/.aws/credentials
const sqsClient = new SQSClient({ 
    region: process.env.AWS_REGION || "us-east-1" ,
    
});

export const pushToSqsQueue = async (doctorId: string, patientId: string, s3Urls: string[], iterationId: string) => {
  const queueUrl = process.env.SQS_QUEUE_URL; // Make sure this is in your .env file!

  if (!queueUrl) {
    throw new Error("SQS_QUEUE_URL is not defined in environment variables");
  }

  // The payload that the Python Lambda will receive
  const messageBody = {
    doctor_id: doctorId,
    patient_id: patientId,
    image_urls: s3Urls,
    iterationId: iterationId
  };

  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageGroupId:doctorId,
    MessageDeduplicationId: `${doctorId}-${iterationId}`,
    MessageBody: JSON.stringify(messageBody),
  });

  try {
    const response = await sqsClient.send(command);
    // { // SendMessageResult
//   MD5OfMessageBody: "STRING_VALUE",
//   MD5OfMessageAttributes: "STRING_VALUE",
//   MD5OfMessageSystemAttributes: "STRING_VALUE",
//   MessageId: "STRING_VALUE",
//   SequenceNumber: "STRING_VALUE",
// };
    console.log(`[SQS] Message sent successfully. MessageId: ${response.MessageId}`);
    return response;
  } catch (error) {
    console.error("[SQS] Failed to send message to queue", error);
    throw error; 
  }
};
