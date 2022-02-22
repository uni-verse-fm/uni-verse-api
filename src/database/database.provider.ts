import mongoose from "mongoose";

const mongoHostName = process.env.MONGO_HOSNAME || 'localhost';
const mongoUsername = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoPort = process.env.MONGO_PORT || 27017;

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: (): Promise<typeof mongoose> =>
            mongoose.connect(`mongodb://${mongoUsername}:${mongoPassword}@${mongoHostName}:${mongoPort}`),
    },
];