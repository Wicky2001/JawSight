import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import ApiError from "../ApiError.js";
import httpStatus from "http-status";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;

export const createAccessToken = (id: string): string => {
  return jwt.sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m',algorithm:'HS256'}); 
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET,{algorithms:['HS256']});
  } catch (error) {
    return null;
  }
};





export const auth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "access-jwt",
    { session: false },
    (err: any, jwtPayload: any) => {
      if (err || !jwtPayload || jwtPayload.id === undefined) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized. Please login."));
      }

      req.user = { id: jwtPayload.id };

      next();
    }
  )(req, res, next);
};
