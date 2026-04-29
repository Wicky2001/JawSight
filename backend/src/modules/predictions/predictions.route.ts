import { Router } from "express";
import { handleRealSnsWebhook, uploadImagesAndQueue } from "./predictions.controller.js";

const router = Router();

router.post("/sns-webhook", handleRealSnsWebhook);
router.post('/upload', uploadImagesAndQueue);

export default router;
