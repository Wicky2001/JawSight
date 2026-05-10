import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import passport from "./helpers/auth/passport.js";
import { errorConverter,errorHandler } from "./helpers/error.handlers.js";
import ApiError from "./helpers/ApiError.js";
import httpStatus from "http-status";
import morgan from "morgan";

const app = express();

const whitelist = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin: function (origin: any, callback: any) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
};

app.use(morgan("combined")); // Use 'combined' for detailed logging, or 'dev' for concise output in development
app.use(passport.initialize());
app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression() as any);
app.use(express.text());

// Mount main routes
app.use("/api", mainRouter);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Page Not Found"));
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
