import {
    Application,
    json,
    urlencoded,
    Response,
    Request,
    NextFunction,
} from "express";
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";
import hpp from "hpp";
import cookieSession from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import helmet from "helmet";
import compression from "compression";
import { Logger } from "winston";
import { config } from "./config";
import appRoutes from "./routes";
import {
    CustomError,
    IErrorResponse,
} from "./shared/globals/helpers/error-handler";

const SERVER_PORT = 8000;
const log: Logger = config.createLogger("server");

export class BackendServer {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routeMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app: Application): void {
        app.use(
            cookieSession({
                name: "session",
                keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
                maxAge: 24 * 7 * 60 * 60 * 1000,
                secure: config.NODE_ENV !== "dev",
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                origin: "*",
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            })
        );
    }

    private standardMiddleware(app: Application): void {
        app.use(compression());
        app.use(json({ limit: "50mb" }));
        app.use(urlencoded({ extended: true, limit: "50mb" }));
    }

    private routeMiddleware(app: Application): void {
        appRoutes(app);
    }

    private globalErrorHandler(app: Application): void {
        app.all("*", (req: Request, res: Response) => {
            res.status(HTTP_STATUS.NOT_FOUND).json({
                message: `${req.originalUrl} not found`,
            });
        });

        app.use(
            (
                error: IErrorResponse,
                _req: Request,
                res: Response,
                next: NextFunction
            ) => {
                log.error(error);
                console.log(error);
                if (error instanceof CustomError) {
                    return res
                        .status(error.statusCode)
                        .json(error.serializeErrors());
                }
                next();
            }
        );
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: HttpServer = new HttpServer(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            log.error(error);
            console.log(error);
        }
    }

    private async createSocketIO(httpServer: HttpServer): Promise<Server> {
        const io: Server = new Server(httpServer, {
            cors: {
                origin: config.CLIENT_URL,
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            },
        });
        const pubClient = createClient({ url: config.REDIS_HOST });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        return io;
    }

    private startHttpServer(httpServer: HttpServer): void {
        log.info(`Server has started with process ${process.pid}`);
        console.log(`Server has started with process ${process.pid}`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Server running on port ${SERVER_PORT}`);
            console.log(`Server running on port ${SERVER_PORT}`);
        });
    }

    private socketIOConnections(io: Server): void {}
}
