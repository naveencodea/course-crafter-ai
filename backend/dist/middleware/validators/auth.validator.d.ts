import { Request, NextFunction } from 'express';
export declare const validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: any, next: NextFunction) => any))[];
export declare const validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: any, next: NextFunction) => any))[];
export declare const validateForgotPassword: (import("express-validator").ValidationChain | ((req: Request, res: any, next: NextFunction) => any))[];
export declare const validateResetPassword: (import("express-validator").ValidationChain | ((req: Request, res: any, next: NextFunction) => any))[];
export declare const validateUpdatePassword: (import("express-validator").ValidationChain | ((req: Request, res: any, next: NextFunction) => any))[];
