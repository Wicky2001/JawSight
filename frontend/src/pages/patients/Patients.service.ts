import type { AxiosRequestConfig } from "axios";
import { api } from "../../helpers/apiClient/apiClient";
import type {
  PatientsQueryParamsType,
  GetPatientsResponseType,
  CreatePatientRequestType,
  UpdatePatientRequestType,
} from "../../../../shared/types/Patients/Patients.types";

const PATIENTS_ENDPOINT = "/patients";

export const fetchPatients = async (
  params: PatientsQueryParamsType,
  config?: AxiosRequestConfig,
) => {
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
