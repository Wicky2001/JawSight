import { Request, Response } from "express";
import { catchAsync } from "../../helpers/error.handlers.js";
import { createAccessToken } from "../../helpers/auth/access.js";
import { createRefreshToken } from "../../helpers/auth/refresh.js";

export const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    let from = req.query.state as string || "/home";
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

    const baseUrl = process.env.FRONTEND_URL!.replace(/\/$/, "");
    if (!from.startsWith("/")) {
      from = "/" + from;
    }
    res.redirect(`${baseUrl}${from}`);
  }
);