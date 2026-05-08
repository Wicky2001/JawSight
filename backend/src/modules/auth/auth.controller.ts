import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../helpers/error.handlers.js";
import { createAccessToken } from "../../helpers/auth/access.js";
import { createRefreshToken } from "../../helpers/auth/refresh.js";
import passport from "passport";
import { de } from "zod/locales";


export const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {
    debugger;
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



export const meController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "access-jwt",
      { session: false },
      async (err: any, jwtPayload: any) => {
        if (err || !jwtPayload || jwtPayload.id === undefined) {
          return res.status(401).json({
            message: "Unauthorized. Please login.",
          });
        }


        return res.status(200).json({
          success: true,
          message: "Authenticated successfully",
          user: {
            id: jwtPayload.id,
          },
        
        });
      },
    )(req, res, next);
  },
);