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
    attributes: [
      "id",
      "patient_id",
      "doctor_id",
      "iteration_code",
      "status",
      "createdAt",
      "updatedAt",
    ],
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
    const rowJson = row.toJSON();
    console.log("Processing Row:", rowJson);
    console.log(
      "patient_id:",
      rowJson.patient_id,
      "patient:",
      rowJson.patient,
      "iteration_code:",
      rowJson.iteration_code,
    );

    const formattedRow: InferenceHistoryRowType = {
      patient_id: Number(rowJson.patient_id),
      patient_name: rowJson.patient?.name || "",
      iteration_code: rowJson.iteration_code,
      status: rowJson.status,
      createdAt: new Date(rowJson.createdAt).toLocaleString(),
      updatedAt: new Date(rowJson.updatedAt).toLocaleString(),
    };

    return formattedRow;
  });

  const response: GetInferenceHistoryResponseType = {
    rows: formattedRows,
    meta: { total: count },
  };

  return response;
};
