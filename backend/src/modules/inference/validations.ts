import ApiError  from "../../helpers/ApiError.js";
import status from "http-status";


export const validateSnsPayload = ({
  doctor_id,
  patient_id,
  iterationId,
  output_images_keys,
}: any) => {

  if (!doctor_id || !patient_id || !iterationId) {
    throw new ApiError(
      status.BAD_REQUEST,
      "Missing required SNS fields",
    );
  }

  const isValid =
    output_images_keys &&
    typeof output_images_keys.left === "string" &&
    typeof output_images_keys.right === "string" &&
    typeof output_images_keys.front === "string";

  if (!isValid) {
    throw new ApiError(
      status.BAD_REQUEST,
      "Invalid output_images_keys",
    );
  }
};