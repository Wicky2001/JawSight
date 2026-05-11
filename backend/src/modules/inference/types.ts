export type UploadedDataObject = {
  doctor_id: number;
  patient_id: number;
  iterationId: string;

  input_image_details: {
    side: string;
    bucket_key: string;
    csv_key?: string;
  }[];
};