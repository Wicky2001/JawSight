import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "./auth/access.js";
import cookie from "cookie";
import ApiError from "./ApiError.js";
import { status } from "http-status";
export const doctorSocketMap = new Map<string, string>();

const parseCookies = (cookieString: string) => {
  return cookieString.split(';').reduce((res: Record<string, string>, c: string) => {
    const [key, val] = c.trim().split('=').map(decodeURIComponent);
    res[key] = val;
    return res;
  }, {});
};


const whitelist = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: whitelist, 
      methods: ["GET", "POST"],
      credentials: true, 
    },
  });

  io.use((socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;

    if(!rawCookie) {
      return next(new ApiError(status.UNAUTHORIZED, "Authentication error: No cookies found"));
    }

    const cookies = cookie.parseCookie(rawCookie);

    const accessToken = cookies['access-token'];

    if (!accessToken) {
      return next(new ApiError(status.UNAUTHORIZED, "Authentication error: Access token missing"));
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !decoded.id) {
      return next(new ApiError(status.UNAUTHORIZED, "Authentication error: Invalid access token"));
    }

    (socket as any).id = decoded.id;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const doctor_id = (socket as any).id;
    
    doctorSocketMap.set(doctor_id, socket.id);
    console.log(`Doctor ${doctor_id} connected and registered with socket ID ${socket.id}`);

    socket.on("disconnect", () => {
      for (const [doc_id, id] of doctorSocketMap.entries()) {
        if (id === socket.id) {
          doctorSocketMap.delete(doc_id);
          console.log(`Doctor ${doc_id} disconnected.`);
          break;
        }
      }
    });
  });

  return io;
}
