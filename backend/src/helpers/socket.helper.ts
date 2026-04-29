import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

// doctor_id -> socket.id
export const doctorSocketMap = new Map<string, string>();

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Adjust as needed for production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("register", (doctor_id: string) => {
      doctorSocketMap.set(doctor_id, socket.id);
      //debugger
      console.log(`Doctor ${doctor_id} registered with socket ID ${socket.id}`);
    });

    socket.on("disconnect", () => {
      for (const [doctor_id, id] of doctorSocketMap.entries()) {
        if (id === socket.id) {
          doctorSocketMap.delete(doctor_id);
          break;
        }
      }
    });
  });

  return io;
}
