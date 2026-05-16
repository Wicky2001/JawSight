import { z } from "zod";

export const getInferenceDetailViewSchema = {
  query: z.object({
    patient_id: z.coerce.number().int().positive(),
    inference_id: z.string().trim().min(1),
  }),
};