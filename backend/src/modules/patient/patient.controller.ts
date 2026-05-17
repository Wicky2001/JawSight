import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../helpers/error.handlers.js";
import * as patientService from "./patient.service.js";
import type {
  GetPatientsRequestType,
  CreatePatientRequestType,
  UpdatePatientRequestType,
} from "../../../../shared/types/Patients/Patients.types.js";
import {
  getPatientListSchema,
  createPatientSchema,
  updatePatientSchema,
  deletePatientSchema,
} from "./patient.validation.js";

export const getPatientListController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = (req as any).user?.id;
    const query: GetPatientsRequestType = getPatientListSchema.query.parse(
      req.query,
    );

    const results = await patientService.getPatients(query, doctorId);

    res.status(httpStatus.OK).json(results);
  },
);

export const getPatientDropdownController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = (req as any).user?.id;
    const results = await patientService.getPatientDropdown(doctorId);

    res.status(httpStatus.OK).json(results);
  },
);

export const createPatientController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = (req as any).user?.id;
    const body: CreatePatientRequestType = createPatientSchema.body.parse(
      req.body,
    );

    await patientService.createPatient(body, doctorId);

    res.status(httpStatus.CREATED).json({
      status: "success",
      message: "Patient created successfully",
    });
  },
);

export const updatePatientController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = (req as any).user?.id;
    const data: UpdatePatientRequestType = updatePatientSchema.body.parse(
      req.body,
    );

    await patientService.updatePatient(data, doctorId);

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Patient updated successfully",
    });
  },
);

export const deletePatientController = catchAsync(
  async (req: Request, res: Response) => {
    const doctorId = req.user?.id;
    const body = deletePatientSchema.body.parse(req.body);
    const { id } = body;

    await patientService.deletePatient(id, doctorId!);

    res.status(httpStatus.OK).json({
      status: "success",
      message: "Patient deleted successfully",
    });
  },
);
