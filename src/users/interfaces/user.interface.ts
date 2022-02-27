import { Document } from 'mongoose';

export interface IUser extends Document {
    readonly _id: string;
    readonly username: string;
    readonly email: string;
    password: string;
}
