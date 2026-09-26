import type { Server as HttpServer } from "http";
import type { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private users = new Map<string, Socket>();

  // Get unique instance of io
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Init socket io
  public initialize(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
      },
    });

    this.io.on("connection", (socket: Socket) => {
      SocketService.getInstance().emitMessage(
        "newMessage",
        "🟢 Un utilisateur s'est connecté",
      );
      this.users.set(socket.id, socket);

      socket.on("disconnect", () => {
        SocketService.getInstance().emitMessage(
          "newMessage",
          "🔴 Un utilisateur s'est déconnecté",
        );
        this.users.delete(socket.id);
      });
    });
  }

  // Method to emit message to all clients
  public emitMessage(event: string, data: unknown) {
    if (this.io) {
      this.io.emit(event, data);
    } else {
      console.error("Socket.IO not initialized");
    }
  }

  public sendPrivateMessage(socketId: string, message: string) {
    const socket = this.users.get(socketId);
    if (socket) {
      socket.emit("privateMessage", message);
    } else {
      console.error(`Failed to send message to ${socketId}, socket not found`);
    }
  }
}

export default SocketService.getInstance();
