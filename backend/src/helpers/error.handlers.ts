import httpStatus from "http-status";
import ApiError from "./classes/ApiError.js";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const errorConverter = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    error = new ApiError(
      (err as any)?.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      (err as any)?.message || "Internal Server Error",
    );
  }

  next(error);
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode =
    (err as any)?.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  const errorMessage = (err as any)?.message || "Internal Server Error";
  const errorStack = (err as any)?.stack || "";

  console.error("\n" + "=".repeat(80));
  console.error(`❌ ERROR OCCURRED at ${new Date().toISOString()}`);
  console.error("=".repeat(80));
  console.error(`📍 Status Code: ${statusCode}`);
  console.error(`📝 Message: ${errorMessage}`);
  console.error(`🔗 Route: ${req.method} ${req.originalUrl}`);
  console.error(`🖥️  IP Address: ${req.ip}`);
  console.error("-".repeat(80));
  console.error("📋 Stack Trace:");
  console.error(errorStack);
  console.error("=".repeat(80) + "\n");

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errors: (err as any)?.errors || undefined,
  });
};

/**
 *  This is the what simply catch async is doing.
 * 
 *  const catchAsync = (fn) => {
        return (req, res, next) => {
          fn(req, res, next).catch(next);
        };
      };
   
   get the controller as input. give it req,res,next as input and call it.

   even if our controller has only req,res as input because in js below format is completely valid.

   function test(a, b, c) {
    console.log(a,b,c);
          }
       test(1, 2);



 * 
 */
export const catchAsync =
  <Req extends Request = Request, Res extends Response = Response>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch((error) =>
      next(error),
    );
  };
