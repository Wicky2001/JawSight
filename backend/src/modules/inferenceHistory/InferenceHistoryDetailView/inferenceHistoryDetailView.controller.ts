import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../helpers/error.handlers.js";
import type { InferenceDetailViewRequestType } from "../../../../../shared/types/InferenceHistory/InferenceHistoryDetailView/InferenceDetalView.types.js";
import { getInferenceDetailViewSchema } from "./inferenceHistoryDetailView.validation.js";
import * as inferenceHistoryDetailViewService from "./inferenceHistoryDetailView.service.js";

export const getInferenceDetailViewController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = req.user?.id;
    const query: InferenceDetailViewRequestType =
      getInferenceDetailViewSchema.query.parse(req.query);

    const result =
      await inferenceHistoryDetailViewService.getInferenceDetailView(
        query,
        doctorId!,
      );

    res.status(httpStatus.OK).json(result);
  },
);
