import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import express from "express";
import { Logger } from "@core/utils";

class SocketManager {
  private server: Server | null = null;
  private io: SocketIOServer | null = null;
  private app: express.Application;

  constructor(app: express.Application, server: Server) {
    this.app = app;
    this.server = server;
  }

  async start() {
    this.server = new Server(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    this.app.set("socketio", this.io);

    const users = new Map<string, string>();

    this.io.on("connection", (socket: Socket) => {
      socket.emit("message", "Hello " + socket.id);

      socket.on("login", (data) => {
        Logger.warn("a user " + data.userId + " connected");
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

      socket.on("assignMemberToCard", (data) => {
        this.sendMessageToUser(users, data.userId, "fetchNotification");
      });

      socket.on("disconnect", () => {
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
      this?.io?.to(socketId).emit("directMessage", { message });
      console.log(`Sent a direct message to user ${userId}`);
    } else {
      console.log(`User ${userId} not currently connected`);
    }
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err: Error | undefined) => {
          if (err) {
            reject(err);
          } else {
            console.log("Socket.IO server stopped");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  broadcast(event: string, message: string): void {
    if (this.io) {
      this.io.emit(event, message);
    }
  }

  getSocketIo(): SocketIOServer | null {
    return this.io;
  }
}

export default SocketManager;
