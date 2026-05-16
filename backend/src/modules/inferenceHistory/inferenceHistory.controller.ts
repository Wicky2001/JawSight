import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../helpers/error.handlers.js";
import * as inferenceHistoryService from "./inferenceHistory.service.js";
import type { GetInferenceHistoryRequestType } from "../../../../shared/types/InferenceHistory/InferenceHistory.types.js";
import { getInferenceHistorySchema } from "./inferenceHistory.validation.js";

export const getInferenceHistoryController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = (req as any).user?.id;
    const query: GetInferenceHistoryRequestType =
      getInferenceHistorySchema.query.parse(req.query);

    const results = await inferenceHistoryService.getInferenceHistory(
      query,
      doctorId,
    );

    res.status(httpStatus.OK).json(results);
  },
);
