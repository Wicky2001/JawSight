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

export type PatientDropdownItemType = {
  id: number;
  name: string;
};

export type GetPatientsResponseType = {
  rows: PatientsRowType[];
  meta: { total: number };
};

export type GetPatientDropdownResponseType = {
  rows: PatientDropdownItemType[];
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
