import { Router } from "express";
import predictionsRouter from "../modules/predictions/predictions.route.js";
import authRouter from "../modules/auth/auth.route.js";

const router = Router();

router.use("/predictions", predictionsRouter);
router.use("/auth", authRouter);

export default router;
