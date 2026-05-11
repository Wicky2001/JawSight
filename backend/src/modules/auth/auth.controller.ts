import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../helpers/error.handlers.js";
import { createAccessToken } from "../../helpers/auth/access.js";
import { createRefreshToken, verifyRefreshToken } from "../../helpers/auth/refresh.js";
import passport from "passport";



export const googleCallbackController = catchAsync(
  async (req: Request, res: Response) => {

   debugger;
    
    let from = req.query.state as string || "/home";
    debugger;
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
   

        return res.status(200).json({
          success: true,
          message: "Authenticated successfully",
          user: req.user,
        
        });
      
  
  },
);

export const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.["refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = createAccessToken(decoded.id);

    res.cookie("access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  }
);