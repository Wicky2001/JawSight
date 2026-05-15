import { Router } from "express";
import inferenceRouter from "../modules/inference/inference.route.js";
import inferenceHistoryRouter from "../modules/inferenceHistory/inferenceHistory.route.js"; 
import authRouter from "../modules/auth/auth.route.js";

const router = Router();

router.use("/inference", inferenceRouter);
router.use("/inference-history", inferenceHistoryRouter);
router.use("/auth", authRouter);


export default router;
