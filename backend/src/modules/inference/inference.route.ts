import { Router } from "express";
import { snsWebhookController, uploadImagesController } from "./inference.controller.js";
import { uploadInferenceImages } from "../../helpers/multer.js";
import { auth } from "../../helpers/auth/access.js";
const router = Router();

router.post("/sns-webhook", snsWebhookController);

// Image upload route
router.route("/").post(auth,uploadInferenceImages.fields([
    { name: "leftImage", maxCount: 1 },
    { name: "rightImage", maxCount: 1 },
    { name: "frontImage", maxCount: 1 },
    { name: "frontCsv", maxCount: 1 },
  ]),uploadImagesController);

export default router;
