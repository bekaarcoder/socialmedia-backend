import dotenv from "dotenv";
import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

dotenv.config({});

class Config {
    public DATABASE_URL: string | undefined;
    public JWT_TOKEN: string | undefined;
    public NODE_ENV: string | undefined;
    public SECRET_KEY_ONE: string | undefined;
    public SECRET_KEY_TWO: string | undefined;
    public CLIENT_URL: string | undefined;
    public REDIS_HOST: string | undefined;

    private readonly DEFAULT_DATABASE_URL =
        "mongodb://0.0.0.0:27017/fbclone-backend";

    constructor() {
        this.DATABASE_URL =
            process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN;
        this.NODE_ENV = process.env.NODE_ENV || "dev";
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || "";
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || "";
        this.CLIENT_URL = process.env.CLIENT_URL || "";
        this.REDIS_HOST = process.env.REDIS_HOST || "";
    }

    // public createLogger(name: string): bunyan {
    //     return bunyan.createLogger({ name, level: "debug" });
    // }

    public createLogger(name: string): Logger {
        return createLogger({
            level: "debug",
            format: combine(
                format.colorize(),
                label({ label: name }),
                timestamp({ format: "HH:mm:ss" }),
                myFormat
            ),
            transports: [new transports.Console()],
        });
    }

    public validateConfig(): void {
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined`);
            }
        }
    }
}

export const config: Config = new Config();
