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
import firebase, { initializeApp } from "firebase/app";
import config from "./core/config/firebaseConfig";
import "./core/config/passportConfig";
import passport from "passport";
import http from "http";
import socketIo from "socket.io";
export default class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;
  public server: http.Server;
  public io: socketIo.Server;

  constructor(routes: Route[]) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server);
    this.port = process.env.PORT || 5000;
    this.production = process.env.NODE_ENV == "production" ? true : false;
    this.connectToDB();
    this.initializeMiddleware();
    this.initialRoutes(routes);
    this.initializeErrorMiddleware();
    this.initializeFireBase();
    this.initSocketIo();
  }

  private initSocketIo() {
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server, {
      cors: {
        origin: "http://localhost:5173",
      },
    });
    this.app.set("socketio", this.io);
    const users = new Map();
    // const users: any = {};
    this.io.on("connection", (socket: socketIo.Socket) => {
      socket.emit("message", "Hello " + socket.id);
      socket.on("login", function (data) {
        Logger.warn("a user " + data.userId + " connected");
        // saving userId to object with socket ID
        // users[socket.id] = data.userId;
        users.set(data.userId, socket.id);
      });

      socket.on("join_board", (data) => {
        const room = data.board;
        socket.join(room);
      });

      socket.on("add_boardMembers", (data) => {
        data.forEach((userId: string) => {
          this.sendMessageToUser(users, userId, "fetchNotification");
        });
      });

      socket.on('assignMemberToCard', (data) => {
        console.log("~~~~~~~~~~~~~~>assignMemberToCard", data);
        this.sendMessageToUser(users, data.userId, "fetchNotification");
      })

      socket.on("disconnect", function () {
        // remove saved socket from users object
        users.forEach((socketId, storedUserId) => {
          if (socketId === socket.id) {
            users.delete(storedUserId);
          }
        });
        Logger.warn("socket disconnected : " + socket.id);
      });
    });
  }

  private sendMessageToUser(
    users: Map<any, any>,
    userId: string,
    message: string
  ) {
    const socketId = users.get(userId);
    if (socketId) {
      this.io.to(socketId).emit("directMessage", { message });
      console.log(`Sent a direct message to user ${userId}`);
    } else {
      console.log(`User ${userId} not currently connected`);
    }
  }

  private initializeFireBase() {
    initializeApp(config.firebaseConfig);
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
    this.app.use(passport.initialize());
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
    this.server.listen(this.port, () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }
}
