import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import httpStatus from "http-status";
import ApiError from "../../../helpers/ApiError.js";
import { s3Client } from "../../../helpers/aws.js";
import db from "../../../sequelize_models/index.js";
import type {
  InferenceDetailViewRequestType,
  InferenceDetailViewResponseType,
} from "../../../../../shared/types/InferenceHistory/InferenceHistoryDetailView/InferenceDetalView.types.js";

const SIGNED_URL_EXPIRY_SECONDS = 30 * 60;

const signBucketKey = async (key: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    });

    // await so the try/catch handles rejections from getSignedUrl
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

export const getInferenceDetailView = async (
  query: InferenceDetailViewRequestType,
  doctorId: number,
): Promise<InferenceDetailViewResponseType> => {
  const { patient_id, inference_id } = query;

  const inferenceHistory = await db.InferenceHistory.findOne({
    where: {
      doctor_id: doctorId,
      patient_id,
      iteration_code: inference_id,
    },
  });

  if (!inferenceHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, "Inference record not found");
  }

  const outputBucketKeys = inferenceHistory.output_bucket_keys;

  if (
    !outputBucketKeys?.left ||
    !outputBucketKeys?.right ||
    !outputBucketKeys?.front
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Inference result is not available yet",
    );
  }

  const left_sign_image_url = await signBucketKey(outputBucketKeys.left);
  const right_sign_image_url = await signBucketKey(outputBucketKeys.right);
  const front_sign_image_url = await signBucketKey(outputBucketKeys.front);

  return {
    left_sign_image_url,
    right_sign_image_url,
    front_sign_image_url,
  };
};
