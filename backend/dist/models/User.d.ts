import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    googleId?: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    emailVerificationToken?: string;
    emailVerificationExpire?: Date;
    emailVerified: boolean;
    createdAt: Date;
    matchPassword(password: string): Promise<boolean>;
    getSignedJwtToken(): string;
    getResetPasswordToken(): string;
    getEmailVerificationToken(): string;
}
interface IUserModel extends mongoose.Model<IUser> {
}
export interface IUserDocument extends IUser, Document {
}
declare const User: IUserModel;
export default User;
