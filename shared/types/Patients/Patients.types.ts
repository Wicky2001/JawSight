import { z } from "zod";

export const sortFields = ["name", "age", "createdAt"] as const;

export interface PatientsQueryParamsType {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export type GetPatientsRequestType = {
  page: number;
  limit: number;
  search?: string;
  sortOrder: "ASC" | "DESC";
  sortField: (typeof sortFields)[number];
};

export type PatientsRowType = {
  id: number;
  name: string;
  age: string;
  email: string;
  gender: "MALE" | "FEMALE";
  createdAt: string;
};

export type GetPatientsResponseType = {
  rows: PatientsRowType[];
  meta: { total: number };
};

export type CreatePatientRequestType = {
  name: string;
  age: number;
  email: string;
  gender: "MALE" | "FEMALE";
};

export type UpdatePatientRequestType = {
  id: number;
  name: string;
  age: number;
  email: string;
  gender: "MALE" | "FEMALE";
};

export type DeletePatientRequestType = {
  id: number;
};

/**
 * Zod validation schemas for patient forms
 */
export const createPatientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  age: z.coerce
    .number()
    .int()
    .min(1, "Age must be greater than 0")
    .max(150, "Age must be less than 150"),
  email: z.string().trim().email("Please enter a valid email"),
  gender: z.enum(["MALE", "FEMALE"]),
});

export const updatePatientFormSchema = createPatientFormSchema;

export type CreatePatientFormType = z.infer<typeof createPatientFormSchema>;
export type UpdatePatientFormType = z.infer<typeof updatePatientFormSchema>;
