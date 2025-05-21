import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Validates the request against the defined validation rules
 */
export declare const validate: RequestHandler;
/**
 * Global error handler middleware
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, next: NextFunction) => void;
export type { ValidationChain };
