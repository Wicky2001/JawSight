import express from "express";
import mainRouter from "./routes/index.js";
import cors from "cors";

const app = express();
app.use(express.json())
app.use(express.text()); 

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

app.use(express.json());

// Mount main routes
app.use("/api", mainRouter);

export default app;
