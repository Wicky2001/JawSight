import { Router } from "express";
import inferenceRouter from "../modules/inference/inference.route.js";
import authRouter from "../modules/auth/auth.route.js";

const router = Router();

router.use("/inference", inferenceRouter);
router.use("/auth", authRouter);


export default router;
