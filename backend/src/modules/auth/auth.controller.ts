import { Request, Response } from "express";
import { catchAsync } from "../../helpers/error.handlers.js";
import { createAccessToken } from "../../helpers/auth/access.js";
import { createRefreshToken } from "../../helpers/auth/refresh.js";

export const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    const doctor = req.user as any;

    const accessToken = createAccessToken(doctor.id);
    const refreshToken = createRefreshToken(doctor.id);

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Update depending on your exact prod env (HTTPS)
      sameSite: "lax",
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Update depending on your exact prod env (HTTPS)
      sameSite: "lax",
    });

    res.redirect(process.env.FRONTEND_URL!);
  }
);