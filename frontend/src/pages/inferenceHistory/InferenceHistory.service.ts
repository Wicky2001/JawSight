import type { AxiosRequestConfig } from 'axios';
import { api } from '../../helpers/apiClient/apiClient';
import type {InferenceHistoryQueryParamsType,GetInferenceHistoryResponseType, InferenceHistoryRowType} from '../../../../shared/types/inferenceHistory.types';

const INFERENCE_HISTORY_ENDPOINT = '/inference-history';

const USE_PLACEHOLDERS = true;

const placeholders: InferenceHistoryRowType[] = Array.from({ length: 100 }, (_, index) => ({
  patient_id: index + 1,
  patient_name: `Patient ${index + 1}`,
  iteration_code: `ITR-${String(index + 1).padStart(4, '0')}`,
  status: index % 3 === 0 ? 'COMPLETED' : index % 3 === 1 ? 'PROCESSING' : 'FAILED',
  createdAt: new Date(Date.now() - (index + 1) * 60000).toLocaleString(),
  updatedAt: new Date(Date.now() - index * 60000).toLocaleString(),
}));

export const fetchInferenceHistory = async (
  params: InferenceHistoryQueryParamsType,
  config?: AxiosRequestConfig,
) => {

  if (USE_PLACEHOLDERS) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 50);
    const search = params.search?.trim().toLowerCase();

    let filtered = [...placeholders];

    if (search) {
      filtered = filtered.filter((row) =>
        row.patient_name.toLowerCase().includes(search) ||
        row.iteration_code.toLowerCase().includes(search) ||
        row.status.toLowerCase().includes(search)
      );
    }

    if (params.sortField) {
      const sortOrder = params.sortOrder ?? 'ASC';
      filtered.sort((a, b) => {
        const aValue = String(a[params.sortField as keyof InferenceHistoryRowType] ?? '');
        const bValue = String(b[params.sortField as keyof InferenceHistoryRowType] ?? '');
        const compare = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
        return sortOrder === 'ASC' ? compare : -compare;
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

  try{

    const response = await api.get(INFERENCE_HISTORY_ENDPOINT, params, config);
    return response.data as GetInferenceHistoryResponseType;

  }catch(error){
    console.error("Error fetching inference history:", error);
    throw error;
  }
 
};
