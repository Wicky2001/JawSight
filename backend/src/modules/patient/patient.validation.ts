import { z } from "zod";
import { sortFields } from "../../../../shared/types/Patients/Patients.types.js";

export const getPatientListSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
    sortField: z.enum(sortFields).default("createdAt"),
  }),
};

export const createPatientSchema = {
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    age: z.number().int().min(19, "Age must be greater than 18"),
    email: z.email("Valid email is required"),
    gender: z.enum(["MALE", "FEMALE"]),
  }),
};

export const updatePatientSchema = {
  body: z.object({
    id: z.coerce.number().int().positive("Patient ID is required"),
    name: z.string().trim().min(1, "Name is required"),
    age: z.number().int().min(19, "Age must be greater than 18"),
    email: z.email("Valid email is required"),
    gender: z.enum(["MALE", "FEMALE"]),
  }),
};

export const deletePatientSchema = {
  body: z.object({
    id: z.coerce.number().int().positive("Patient ID is required"),
  }),
};
