import { Route } from "@core/interfaces";
import express from "express";
import mongoose from "mongoose";
import hpp from "hpp";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { Logger } from "@core/utils";
import { errorMiddleWare } from "@core/middleware";
import cookieParser from "cookie-parser";

export default class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == "production" ? true : false;
    this.connectToDB();
    this.initializeMiddleware();
    this.initialRoutes(routes);
    this.initializeErrorMiddleware();
  }

  private initialRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  private initializeMiddleware() {
    if (this.production) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(
        cors({
          origin: "http://localhost:3000",
          credentials: true,
        })
      );
      this.app.use(cookieParser());
    } else {
      this.app.use(morgan("dev"));
      this.app.use(
        cors({
          origin: true,
          credentials: true,
        })
      );
      this.app.use(cookieParser());
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
  }

  private initializeErrorMiddleware() {
    this.app.use(errorMiddleWare);
  }

  private connectToDB() {
    const connectString = process.env.DATABASE?.replace(
      "<PASSWORD>",
      process.env.PASSWORD || ""
    );

    if (!connectString) {
      Logger.error("Connection String is invalid");
      return;
    }

    mongoose.connect(connectString).catch((reason) => {
      Logger.error(reason);
    });
    Logger.info("Database connected....");
  }

  public listen() {
    this.app.listen(this.port, () => {
      Logger.info(`Server is listening on ${this.port}`);
    });
  }
}
