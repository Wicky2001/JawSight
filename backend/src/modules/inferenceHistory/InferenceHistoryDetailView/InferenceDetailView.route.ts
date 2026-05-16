import { Router } from "express";
import { getInferenceDetailViewController } from "./inferenceHistoryDetailView.controller.js";
import { getInferenceDetailViewSchema } from "./inferenceHistoryDetailView.validation.js";
import validate from "../../../helpers/validate.js";
import { auth } from "../../../helpers/auth/access.js";

const router = Router();

router
  .route("/")
  .get(
    auth,
    validate(getInferenceDetailViewSchema),
    getInferenceDetailViewController,
  );

export default router;
