import { Router } from "express";
import predictionsRouter from "../modules/predictions/predictions.route.js";

const router = Router();

router.use("/predictions", predictionsRouter);

export default router;
