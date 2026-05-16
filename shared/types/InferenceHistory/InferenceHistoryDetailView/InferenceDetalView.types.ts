export type InferenceDetailViewRequestType = {
  patient_id: number;
  inference_id: string;
};

export type InferenceDetailViewResponseType = {
  left_sign_image_url: string;
  right_sign_image_url: string;
  front_sign_image_url: string;
};
