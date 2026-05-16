import { Router } from "express";
import validate from "../../helpers/validate.js";
import { getInferenceHistorySchema } from "./inferenceHistory.validation.js";
import { getInferenceHistoryController } from "./inferenceHistory.controller.js";
import { auth } from "../../helpers/auth/access.js";
import inferenceDetailViewRouter from "./InferenceHistoryDetailView/InferenceDetailView.route.js";

const router = Router();

router.route("/")
  .get(auth,validate(getInferenceHistorySchema), getInferenceHistoryController);

router.use("/detail-view", inferenceDetailViewRouter);

export default router;