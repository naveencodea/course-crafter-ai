interface SendEmailOptions {
    email: string;
    subject: string;
    template: string;
    data?: Record<string, any>;
}
declare const sendEmail: (options: SendEmailOptions) => Promise<void>;
export { sendEmail };
