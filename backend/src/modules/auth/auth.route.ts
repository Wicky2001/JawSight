import { Router } from "express";
import passport from "passport";
import { googleCallbackController, meController } from "./auth.controller.js";

const router = Router();


router.get(
  "/google",
  (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: (req.query.from as string) || "/",
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallbackController
);



router.get("/me",meController);

export default router;