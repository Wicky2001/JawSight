import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import ApiError from './ApiError.js';

export type ValidationSchema = {
  body?: any;
  query?: any;
  params?: any;
};

const validate =
  (schema: ValidationSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        Object.defineProperty(req, 'params', { value: await schema.params.parseAsync(req.params), enumerable: true, configurable: true, writable: true });
      }
      if (schema.query) {
        Object.defineProperty(req, 'query', { value: await schema.query.parseAsync(req.query), enumerable: true, configurable: true, writable: true });
      }
      if (schema.body) {
        Object.defineProperty(req, 'body', { value: await schema.body.parseAsync(req.body), enumerable: true, configurable: true, writable: true });
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          errors[field] = issue.message;
        });
        const apiError = new ApiError(httpStatus.BAD_REQUEST, 'Validation failed');
        // Add additional property if you support error arrays
        (apiError as any).errors = errors; 
        return next(apiError);
      }
      return next(error);
    }
  };

export default validate;
