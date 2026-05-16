import { Router } from "express";
import validate from "../../../helpers/validate.js";
import { auth } from "../../../helpers/auth/access.js";
import { getPatientDetailViewController } from "./PatientDetailView.controller.js";
import { getPatientDetailViewSchema } from "./PatientDetailView.validation.js";

const router = Router();

router
  .route("/")
  .get(auth, validate(getPatientDetailViewSchema), getPatientDetailViewController);

export default router;
