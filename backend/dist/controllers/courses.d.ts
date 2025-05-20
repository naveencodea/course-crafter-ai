import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
type RequestBody<T> = Request<{}, {}, T>;
type TypedAuthRequest<T = {}> = AuthRequest & RequestBody<T>;
type ExportFormat = 'txt' | 'pdf';
interface GenerateCourseBody {
    coursePrompt: string;
    format?: ExportFormat;
}
export declare const generateCourse: (req: TypedAuthRequest<GenerateCourseBody>, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCourses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCourse: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
