import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import httpStatus from "http-status";
import ApiError from "../../../helpers/ApiError.js";
import { s3Client } from "../../../helpers/aws.js";
import db from "../../../sequelize_models/index.js";
import type {
  PatientsDetailViewRequestType,
  PatientsDetailViewResponseType,
} from "../../../../../shared/types/Patients/PatientsDetailView/PatientsDetailView.types.js";

const SIGNED_URL_EXPIRY_SECONDS = 30 * 60;

const signBucketKey = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    });
  } catch (error) {
    console.error("signBucketKey failed:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error generating signed URL",
      undefined,
      error,
    );
  }
};

export const getPatientDetailView = async (
  query: PatientsDetailViewRequestType,
  doctorId: number,
): Promise<PatientsDetailViewResponseType> => {
  try {
    const { id: patientId } = query;

    const patient = await db.Patient.findOne({
      where: {
        id: patientId,
        doctor_id: doctorId,
      },
    });

    if (!patient) {
      throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
    }

    const inferenceHistories = await db.InferenceHistory.findAll({
      where: {
        patient_id: patientId,
        doctor_id: doctorId,
      },
      order: [["createdAt", "ASC"]],
    });

    const iteration_details: PatientsDetailViewResponseType["iteration_details"] =
      [];

    for (const history of inferenceHistories) {
      const historyJson = history.toJSON();
      const outputBucketKeys = historyJson.output_bucket_keys;

      if (
        !outputBucketKeys?.left ||
        !outputBucketKeys?.right ||
        !outputBucketKeys?.front
      ) {
        continue;
      }

      iteration_details.push({
        iteration_code: historyJson.iteration_code,
        left_sign_image_url: await signBucketKey(outputBucketKeys.left),
        right_sign_image_url: await signBucketKey(outputBucketKeys.right),
        front_sign_image_url: await signBucketKey(outputBucketKeys.front),
      });
    }

    return {
      iteration_details,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching patient detail view",
      undefined,
      error,
    );
  }
};
