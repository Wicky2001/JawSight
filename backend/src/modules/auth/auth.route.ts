import { Router } from "express";
import passport from "passport";
import { googleCallbackController, meController, refreshTokenController } from "./auth.controller.js";
import { auth } from "../../helpers/auth/access.js";

const router = Router();

//route user to Google for authentication, with the "from" query parameter to redirect back after successful login
router.get(
  "/google",
  (req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: (req.query.from as string) || "/home",
    })(req, res, next);
  }
);

//login and token generation happens in the callback route after successful authentication with Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallbackController
);

router.post("/refresh", refreshTokenController);

router.get("/me", auth, meController);

export default router;