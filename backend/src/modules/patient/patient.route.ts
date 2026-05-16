import { Router } from "express";
import validate from "../../helpers/validate.js";
import { auth } from "../../helpers/auth/access.js";
import {
  getPatientListController,
  createPatientController,
  updatePatientController,
  deletePatientController,
} from "./patient.controller.js";
import {
  getPatientListSchema,
  createPatientSchema,
  updatePatientSchema,
  deletePatientSchema,
} from "./patient.validation.js";

const router = Router();

router
  .route("/")
  .get(auth, validate(getPatientListSchema), getPatientListController)
  .post(auth, validate(createPatientSchema), createPatientController)
  .put(auth, validate(updatePatientSchema), updatePatientController)
  .delete(auth, validate(deletePatientSchema), deletePatientController);

export default router;
