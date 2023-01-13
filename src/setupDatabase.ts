import mongoose from "mongoose";
import { Logger } from "winston";
import { config } from "./config";

const log: Logger = config.createLogger("db");

export default () => {
    const connect = () => {
        mongoose.set("strictQuery", false);
        mongoose
            .connect(`${config.DATABASE_URL}`)
            .then(() => {
                log.info("Database connected.");
            })
            .catch((error) => {
                log.error("Error connecting to the database", error);
                console.log("Error connecting to the database", error);
                return process.exit(1);
            });
    };

    connect();
    mongoose.connection.on("disconnected", connect);
};
