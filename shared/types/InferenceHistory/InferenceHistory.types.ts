
export const sortFields = ['createdAt', 'updatedAt', 'patient_name', 'status'] as const;




export interface InferenceHistoryQueryParamsType {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}



export type GetInferenceHistoryRequestType = {
  page: number;
  limit: number;
  search?: string;
  sortOrder: "ASC" | "DESC";
  sortField: typeof sortFields[number];
};


export type InferenceHistoryRowType = {
  patient_id: number;
  patient_name: string;
  iteration_code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type GetInferenceHistoryResponseType = {
  rows: InferenceHistoryRowType[];
  meta: { total: number};
};
