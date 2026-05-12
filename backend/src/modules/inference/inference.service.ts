import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { s3Client } from "../../helpers/aws.js";
import {sqsClient} from "../../helpers/aws.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadedDataObject } from "./types.js";
import db from "../../sequelize_models/index.js";
import ApiError from "../../helpers/ApiError.js";
import status from "http-status";


export const pushToSqsQueue = async (messageBody: UploadedDataObject) => {
  const queueUrl = process.env.SQS_QUEUE_URL; 

  if (!queueUrl) {
    throw new Error("SQS_QUEUE_URL is not defined in environment variables");
  }



  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageDeduplicationId: `${messageBody.doctor_id}-${messageBody.patient_id}-${messageBody.iterationId}`,
    MessageBody: JSON.stringify(messageBody),
  });

  try {
    const response = await sqsClient.send(command);

  
    return response;
  } catch (error) {

    throw new ApiError(status.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Unknown error while sending input image details to SQS");
 
  }
};

// Helper upload function
const uploadSingleFile = async (file: Express.Multer.File, key: string) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
};




export const uploadImagesToS3 = async (
  files: { [fieldname: string]: Express.Multer.File[] },

  patientId: number,

  iterationId: string,

  doctorId: number,
): Promise<UploadedDataObject> => {

  const input_image_details: {
    side: string;
    bucket_key: string;
    csv_key?: string;
  }[] = [];

  // LEFT IMAGE
  const leftImage = files.leftImage?.[0];

  if (leftImage) {
    const extension = leftImage.mimetype.split("/")[1];

    const key = `${doctorId}/${patientId}/${iterationId}/input/left.${extension}`;

    await uploadSingleFile(leftImage, key);

    input_image_details.push({
      side: "left",
      bucket_key: key,
    });
  }

  // RIGHT IMAGE
  const rightImage = files.rightImage?.[0];

  if (rightImage) {
    const extension = rightImage.mimetype.split("/")[1];

    const key = `${doctorId}/${patientId}/${iterationId}/input/right.${extension}`;

    await uploadSingleFile(rightImage, key);

    input_image_details.push({
      side: "right",
      bucket_key: key,
    });
  }

  // FRONT IMAGE
  const frontImage = files.frontImage?.[0];

  const frontCsv = files.frontCsv?.[0];

  if (frontImage) {
    const extension = frontImage.mimetype.split("/")[1];

    const imageKey = `${doctorId}/${patientId}/${iterationId}/input/front.${extension}`;

    await uploadSingleFile(frontImage, imageKey);

    let csvKey: string | undefined;

    if (frontCsv) {
      csvKey = `${doctorId}/${patientId}/${iterationId}/input/front.csv`;

      await uploadSingleFile(frontCsv, csvKey);
    }

    input_image_details.push({
      side: "front",
      bucket_key: imageKey,
      csv_key: csvKey,
    });
  }

  return {
    doctor_id: doctorId,

    patient_id: patientId,

    iterationId,

    input_image_details,
  };
};

export const saveInputImageKeysToDB = async (
  uploadedData: UploadedDataObject,
): Promise<void> => {
  try {
    await db.sequelize.transaction(async (t) => {
      // uploadedData.doctor_id might be something like 'D_5', extract the integer
      const doctorIdNum = uploadedData.doctor_id;
      const patientIdNum = uploadedData.patient_id;

      // Verify the patient actually exists first
      const existingPatient = await db.Patient.findOne({
        where: {
          id: patientIdNum,
        },
        transaction: t,
      });

      if (!existingPatient) {
        throw new ApiError(status.NOT_FOUND, "Patient not found");
      }

      // Create all the input image entries
      const imageCreationPromises = uploadedData.input_image_details.map(
        (imageDetail) => {
          return db.PatientInputImage.create(
            {
              patient_id: patientIdNum,
              doctor_id: doctorIdNum,
              bucket_key: imageDetail.bucket_key,
              iteration_code: uploadedData.iterationId,
              direction: "in",
              view_position: imageDetail.side, // Ensure 'front', 'left', or 'right'
            },
            { transaction: t }
          );
        }
      );

      await Promise.all(imageCreationPromises);
    });
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      status.INTERNAL_SERVER_ERROR,
      `Database error: ${err.message || "Unknown database error"}`
    );
  }
};

export const saveOutputImageKeysToDB = async (
  doctorId: number | string,
  patientId: number | string,
  iterationId: string,
  outputKeys: { left: string; right: string; front: string }
): Promise<void> => {
  try {
    await db.sequelize.transaction(async (t) => {
      const doctorIdNum = typeof doctorId === 'string' ? parseInt(doctorId.replace(/\D/g, ""), 10) : doctorId;
      const patientIdNum = typeof patientId === 'string' ? parseInt(patientId, 10) : patientId;

      const existingPatient = await db.Patient.findOne({
        where: { id: patientIdNum },
        transaction: t,
      });

      if (!existingPatient) {
        throw new ApiError(status.NOT_FOUND, "Patient not found");
      }

      const sides = ["left", "right", "front"] as const;
      
      const imageCreationPromises = sides.map((side) => {
        return db.PatientOutputImage.create(
          {
            patient_id: patientIdNum,
            doctor_id: doctorIdNum,
            bucket_key: outputKeys[side],
            iteration_code: iterationId,
            direction: "out",
            view_position: side,
          },
          { transaction: t }
        );
      });

      await Promise.all(imageCreationPromises);
    });
  } catch (err: any) {
    console.error("saveOutputImageKeysToDB error", err);
  }
};

export const generateSignedUrls = async (
  outputKeys: { left: string; right: string; front: string }
) => {
  try {
    const urls: Record<string, string> = {};

    for (const [side, key] of Object.entries(outputKeys)) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      });
      // 1 hour
      urls[side] = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    return urls;
  } catch (error) {
    console.error("Failed to generate signed URLs", error);
    throw new Error("Could not generate signed URLs");
  }
};
