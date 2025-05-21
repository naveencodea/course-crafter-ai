import { Request, Response, NextFunction } from 'express';
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
