import type { AxiosRequestConfig } from "axios";
import { api } from "../../helpers/apiClient/apiClient";
import type {
  InferenceHistoryQueryParamsType,
  GetInferenceHistoryResponseType,
} from "../../../../shared/types/InferenceHistory/InferenceHistory.types";

const INFERENCE_HISTORY_ENDPOINT = "/inference-history";

export const fetchInferenceHistory = async (
  params: InferenceHistoryQueryParamsType,
  config?: AxiosRequestConfig,
) => {
  try {
    const response = await api.get(INFERENCE_HISTORY_ENDPOINT, params, config);
    return response.data as GetInferenceHistoryResponseType;
  } catch (error) {
    console.error("Error fetching inference history:", error);
    throw error;
  }
};
