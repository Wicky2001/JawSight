import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../helpers/error.handlers.js";
import type { PatientsDetailViewRequestType } from "../../../../../shared/types/Patients/PatientsDetailView/PatientsDetailView.types.js";
import { getPatientDetailViewSchema } from "./PatientDetailView.validation.js";
import * as patientDetailViewService from "./PatientDetailView.service.js";

export const getPatientDetailViewController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = req.user?.id;
    const query: PatientsDetailViewRequestType =
      getPatientDetailViewSchema.query.parse(req.query);

    const result = await patientDetailViewService.getPatientDetailView(
      query,
      doctorId!,
    );

    res.status(httpStatus.OK).json(result);
  },
);
