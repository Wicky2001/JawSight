import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { doctorSocketMap } from "../../helpers/socket.helper.js";
import { pushToSqsQueue, uploadImagesToS3, saveInputImageKeysToDB } from "./inference.service.js";
import ApiError from "../../helpers/ApiError.js";
import { catchAsync } from "../../helpers/error.handlers.js";
import {v4 as uuidv4} from "uuid";
import { UploadedDataObject } from "./types.js";


export const snsWebhookController = async (req: Request, res: Response) => {
  try {
    const snsMessageType = req.headers['x-amz-sns-message-type'];
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (snsMessageType === 'SubscriptionConfirmation') {
      console.log("Received SNS Subscription Confirmation!");

      const subscribeUrl = body.SubscribeURL;
      const topicArn = body.TopicArn;

      if (!subscribeUrl) {
        console.log("❌ No SubscribeURL found in confirmation message");
        return res.status(400).json({ error: "no_subscribe_url" });
      }

      const response = await fetch(subscribeUrl);
     
        if (!response.ok) {
            console.log("❌ Failed to confirm SNS subscription", await response.text());    
            return res.status(500).json({ error: "subscription_confirmation_failed" });
        }

      return res.status(200).json({
        status: "subscription_confirmed",
        topic_arn: topicArn,
      });
    } 
    
    if (snsMessageType === 'Notification') {
      console.log("Received Real SNS Notification!");
      
      // The payload you sent from Lambda is stringified inside the 'Message' property
      const response = JSON.parse(body.Message); 
      console.log("Parsed SNS Message:", response);
      
      const { doctor_id, patient_id, imageUrl, iterationId } = response.data;

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

export const uploadImagesController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { patient_id } = req.body;
    
    const iterationId = `iter_${uuidv4()}`; 


     const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const leftImage = files.leftImage?.[0];
    const rightImage = files.rightImage?.[0];
    const frontImage = files.frontImage?.[0];
    const frontCsv = files.frontCsv?.[0];

    if (!leftImage || !rightImage || !frontImage || !frontCsv) {
      return next(new ApiError(httpStatus.BAD_REQUEST, "All images and CSV file are required"));
    }


    //Upload images to S3 and get their URLs

    const uploadedData: UploadedDataObject = await uploadImagesToS3(files, patient_id, iterationId,req.user?.id!);
    
    // save bucket keys to DB
    await saveInputImageKeysToDB(uploadedData);

    // 3. Push the message to SQS
    await pushToSqsQueue(uploadedData);
  
    res.status(httpStatus.ACCEPTED).json({
      status: "success",
      message: "Images successfully uploaded and queued for ML processing.",
      data: {
        iterationId : iterationId,
        status: "PROCESSING"
      }
    });

  } );
