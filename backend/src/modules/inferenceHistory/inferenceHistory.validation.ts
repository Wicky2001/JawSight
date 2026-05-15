import { z } from 'zod';
import { sortFields } from '../../../../shared/types/inferenceHistory.types.js';




export const getInferenceHistorySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
    sortField: z.enum(sortFields).default('createdAt'),
  }),
};
