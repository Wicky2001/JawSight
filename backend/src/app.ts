import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";

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

app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
// app.use(responseHandler); // Note: Uncomment and import responseHandler when available
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression() as any);
app.use(express.text());

// Mount main routes
app.use("/api", mainRouter);

export default app;
