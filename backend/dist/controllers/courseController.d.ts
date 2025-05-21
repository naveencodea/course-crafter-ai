import { Request, Response } from 'express';
interface GenerateCourseRequest extends Request {
    body: {
        topic: string;
        format?: 'txt' | 'pdf';
    };
}
interface ExportCourseRequest extends Request<{
    id: string;
}, any, any, {
    format?: 'txt' | 'pdf';
}> {
}
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}
export declare const generateCourse: (req: GenerateCourseRequest, res: Response<ApiResponse>) => Promise<void>;
export declare const exportCourse: (req: ExportCourseRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
