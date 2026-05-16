import { z } from "zod";

export const getPatientDetailViewSchema = {
  query: z.object({
    id: z.coerce.number().int().positive(),
  }),
};
