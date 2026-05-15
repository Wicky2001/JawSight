import { Router } from "express";
import validate from "../../helpers/validate.js";
import { getInferenceHistorySchema } from "./inferenceHistory.validation.js";
import { getInferenceHistoryController } from "./inferenceHistory.controller.js";
import { auth } from "../../helpers/auth/access.js";

const router = Router();

router.route("/")
  .get(auth,validate(getInferenceHistorySchema), getInferenceHistoryController);

export default router;