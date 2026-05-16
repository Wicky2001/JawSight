import db from "../../sequelize_models/index.js";
import type {
  GetInferenceHistoryRequestType,
  GetInferenceHistoryResponseType,
  InferenceHistoryRowType,
} from "../../../../shared/types/InferenceHistory/InferenceHistory.types.js";
import { Op } from "sequelize";

export const getInferenceHistory = async (
  query: GetInferenceHistoryRequestType,
  doctorId: number,
): Promise<GetInferenceHistoryResponseType> => {
  const { page, limit, search, sortOrder, sortField } = query;
  const offset = (page - 1) * limit;

  const whereClause: any = { doctor_id: doctorId };
  if (search) {
    whereClause["$patient.name$"] = {
      [Op.iLike]: `%${search}%`,
    };
  }

  let order: any[] = [];

  if (sortField === "patient_name") {
    order = [[{ model: db.Patient, as: "patient" }, "name", sortOrder]];
  } else {
    order = [[sortField, sortOrder]];
  }

  const { rows, count } = await db.InferenceHistory.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: db.Patient,
        as: "patient",
        attributes: ["id", "name"],
      },
    ],
    order,
    limit,
    offset,
  });

  const formattedRows = rows.map((row: any) => {
    const formattedRow: InferenceHistoryRowType = {
      patient_id: row.patient.id,
      patient_name: row.patient.name,
      iteration_code: row.iteration_code,
      status: row.status,
      createdAt: new Date(row.createdAt).toLocaleString(),
      updatedAt: new Date(row.updatedAt).toLocaleString(),
    };
    return formattedRow;
  });

  const response: GetInferenceHistoryResponseType = {
    rows: formattedRows,
    meta: { total: count },
  };

  return response;
};
