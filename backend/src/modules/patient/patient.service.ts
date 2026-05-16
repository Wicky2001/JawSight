import db from "../../sequelize_models/index.js";
import type {
  GetPatientsRequestType,
  GetPatientsResponseType,
  PatientsRowType,
  CreatePatientRequestType,
  UpdatePatientRequestType,
} from "../../../../shared/types/Patients/Patients.types.js";
import ApiError from "../../helpers/ApiError.js";
import httpStatus from "http-status";
import { Op } from "sequelize";

export const getPatients = async (
  query: GetPatientsRequestType,
  doctorId: number,
): Promise<GetPatientsResponseType> => {
  try {
    const { page, limit, search, sortOrder, sortField } = query;
    const offset = (page - 1) * limit;

    const whereClause: any = { doctor_id: doctorId };
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const order: any[] = [[sortField, sortOrder]];

    const { rows, count } = await db.Patient.findAndCountAll({
      where: whereClause,
      order,
      limit,
      offset,
    });

    const formattedRows = rows.map((row: any) => {
      const formattedRow: PatientsRowType = {
        id: row.id,
        name: row.name,
        age: String(row.age),
        email: row.email,
        createdAt: new Date(row.createdAt).toLocaleString(),
      };
      return formattedRow;
    });

    const response: GetPatientsResponseType = {
      rows: formattedRows,
      meta: { total: count },
    };

    return response;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching patients",
      undefined,
      error,
    );
  }
};

export const createPatient = async (
  data: CreatePatientRequestType,
  doctorId: number,
): Promise<PatientsRowType> => {
  try {
    const newPatient = await db.sequelize.transaction(async (t) => {
      const patient = await db.Patient.create(
        {
          doctor_id: doctorId,
          name: data.name,
          age: data.age,
          email: data.email,
        },
        { transaction: t },
      );

      return patient;
    });

    return {
      id: newPatient.id,
      name: newPatient.name,
      age: String(newPatient.age),
      email: newPatient.email,
      createdAt: new Date(newPatient.createdAt).toLocaleString(),
    };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating patient",
      undefined,
      error,
    );
  }
};

export const updatePatient = async (
  data: UpdatePatientRequestType,
  doctorId: number,
): Promise<PatientsRowType> => {
  try {
    const updatedPatient = await db.sequelize.transaction(async (t) => {
      const existing = await db.Patient.findOne({
        where: {
          id: data.id,
          doctor_id: doctorId,
        },
        transaction: t,
      });

      if (!existing) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Patient not found or you do not have permission to update it",
        );
      }

      await existing.update(
        {
          name: data.name,
          age: data.age,
          email: data.email,
        },
        { transaction: t },
      );

      return existing;
    });

    return {
      id: updatedPatient.id,
      name: updatedPatient.name,
      age: String(updatedPatient.age),
      email: updatedPatient.email,
      createdAt: new Date(updatedPatient.createdAt).toLocaleString(),
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating patient",
      undefined,
      error,
    );
  }
};

export const deletePatient = async (
  patientId: number,
  doctorId: number,
): Promise<void> => {
  try {
    await db.sequelize.transaction(async (t) => {
      const existing = await db.Patient.findOne({
        where: {
          id: patientId,
          doctor_id: doctorId,
        },
        transaction: t,
      });

      if (!existing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
      }

      await existing.destroy({ transaction: t });
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting patient",
      undefined,
      error,
    );
  }
};
