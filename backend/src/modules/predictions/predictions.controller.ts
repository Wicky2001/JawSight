import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { doctorSocketMap } from "../../helpers/socket.helper.js";
import { pushToSqsQueue } from "./predictions.service.js";
import ApiError from "../../helpers/classes/ApiError.js";
import https from "https";

export const handleRealSnsWebhook = (req: Request, res: Response) => {
  try {
    // AWS SNS sometimes sends data as text/plain. Ensure your Express app 
    // can parse it (e.g., app.use(express.json({type: ['application/json', 'text/plain']})))
    const snsMessageType = req.headers['x-amz-sns-message-type'];
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (snsMessageType === 'SubscriptionConfirmation') {
      // 1. AWS is checking if your server is alive. You must visit the SubscribeURL.
      console.log("Received SNS Subscription Confirmation!");
      https.get(body.SubscribeURL, (awsRes:any) => {
        console.log(`AWS Confirmation Status: ${awsRes.statusCode}`);
      });
      return res.status(200).send("Confirmation accepted.");
    } 
    
    if (snsMessageType === 'Notification') {
      // 2. This is the actual message from your Python Lambda!
      console.log("Received Real SNS Notification!");
      
      // The payload you sent from Lambda is stringified inside the 'Message' property
      const predictionData = JSON.parse(body.Message); 
      const { doctor_id, patient_id, imageUrl, iterationId } = predictionData;

      const io = req.app.get("socketio");
      const targetSocketId = doctorSocketMap.get(doctor_id);

      if (targetSocketId) {
        io.to(targetSocketId).emit("prediction_complete", {
          patient_id,
          imageUrl,
          iterationId
        });
        console.log(`Pushed real AWS result to socket ${targetSocketId}`);
      } else {
        console.log(`Doctor ${doctor_id} is not connected.`);
      }

      return res.status(200).send("Message Processed");
    }

    res.status(200).send("Unknown message type");

  } catch (error) {
    console.error("SNS Webhook Error:", error);
    res.status(500).send("Server Error");
  }
};

export const uploadImagesAndQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract data from the request body
    // (Assuming you are passing doctorId and patientId from the frontend)
    const { doctor_id, patient_id } = req.body;
    
    // Generate a unique ID for this specific prediction run
    const iterationId = `iter_${Date.now()}`; 

    // 2. Handle Image Upload to S3 here
    // In a real scenario, you would upload req.files to S3 and get the URLs back.
    // For now, we will mock the S3 URLs:
    const s3Urls = [
      "https://your-bucket.s3.amazonaws.com/mock-image-1.jpg",
      "https://your-bucket.s3.amazonaws.com/mock-image-2.jpg"
    ];

    // 3. Push the message to SQS
    const response = await pushToSqsQueue(doctor_id, patient_id, s3Urls, iterationId);

    // 4. Return an immediate 202 Accepted response to the frontend
    // This tells the React app to start the loading spinner!
    res.status(httpStatus.ACCEPTED).json({
      status: "success",
      message: "Images successfully uploaded and queued for ML processing.",
      data: {
        iterationId,
        status: "PROCESSING"
      }
    });

  } catch (error) {
    // Pass the error to your global error handler middleware
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to queue prediction task"));
  }
};
