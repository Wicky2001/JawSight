import { api } from "../../helpers/apiClient/apiClient";
import type { GetPatientDropdownResponseType } from "../../../../shared/types/Patients/Patients.types";

const PATIENTS_DROPDOWN_ENDPOINT = "/patients/dropdown";

export const fetchPatientDropdown = async () => {
  const response = await api.get(PATIENTS_DROPDOWN_ENDPOINT);
  return response.data as GetPatientDropdownResponseType;
};