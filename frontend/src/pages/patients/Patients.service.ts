import type { AxiosRequestConfig } from "axios";
import { api } from "../../helpers/apiClient/apiClient";
import type {
  PatientsQueryParamsType,
  GetPatientsResponseType,
  PatientsRowType,
  CreatePatientRequestType,
  UpdatePatientRequestType,
} from "../../../../shared/types/Patients/Patients.types";

const PATIENTS_ENDPOINT = "/patients";
const USE_PLACEHOLDERS = true;

const placeholders: PatientsRowType[] = Array.from(
  { length: 100 },
  (_, index) => ({
    id: index + 1,
    name: `Patient ${index + 1}`,
    age: String(20 + (index % 60)),
    email: `patient${index + 1}@hospital.com`,
    gender: index % 2 === 0 ? "MALE" : "FEMALE",
    createdAt: new Date(
      Date.now() - (index + 1) * 86400000,
    ).toLocaleDateString(),
  }),
);

export const fetchPatients = async (
  params: PatientsQueryParamsType,
  config?: AxiosRequestConfig,
) => {
  if (USE_PLACEHOLDERS) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 10);
    const search = params.search?.trim().toLowerCase();

    let filtered = [...placeholders];

    if (search) {
      filtered = filtered.filter(
        (row) =>
          row.name.toLowerCase().includes(search) ||
          row.email.toLowerCase().includes(search),
      );
    }

    if (params.sortField) {
      const sortOrder = params.sortOrder ?? "ASC";
      filtered.sort((a, b) => {
        const aValue = String(
          a[params.sortField as keyof PatientsRowType] ?? "",
        );
        const bValue = String(
          b[params.sortField as keyof PatientsRowType] ?? "",
        );
        const compare = aValue.localeCompare(bValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return sortOrder === "ASC" ? compare : -compare;
      });
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedRows = filtered.slice(start, end);

    return {
      rows: pagedRows,
      meta: { total: filtered.length },
    };
  }

  try {
    const response = await api.get(PATIENTS_ENDPOINT, params, config);
    return response.data as GetPatientsResponseType;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const createPatient = async (
  data: CreatePatientRequestType,
  config?: AxiosRequestConfig,
) => {
  if (USE_PLACEHOLDERS) {
    const newPatient: PatientsRowType = {
      id: Math.max(...placeholders.map((p) => p.id)) + 1,
      name: data.name,
      age: String(data.age),
      email: data.email,
      gender: data.gender,
      createdAt: new Date().toLocaleDateString(),
    };
    placeholders.unshift(newPatient);
    return newPatient;
  }

  try {
    const response = await api.post(PATIENTS_ENDPOINT, data, config);
    return response.data;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
};

export const updatePatient = async (
  patientId: number,
  data: Omit<UpdatePatientRequestType, "id">,
  config?: AxiosRequestConfig,
) => {
  if (USE_PLACEHOLDERS) {
    const index = placeholders.findIndex((p) => p.id === patientId);
    if (index !== -1) {
      placeholders[index] = {
        ...placeholders[index],
        name: data.name,
        age: String(data.age),
          email: data.email,
          gender: data.gender,
      };
      return placeholders[index];
    }
  }

  try {
    const response = await api.put(
      PATIENTS_ENDPOINT,
      { ...data, id: patientId },
      config,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

export const deletePatient = async (
  patientId: number,
  config?: AxiosRequestConfig,
) => {
  if (USE_PLACEHOLDERS) {
    const index = placeholders.findIndex((p) => p.id === patientId);
    if (index !== -1) {
      placeholders.splice(index, 1);
    }
    return { success: true };
  }

  try {
    const response = await api.delete(
      PATIENTS_ENDPOINT,
      { id: patientId },
      config,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};
