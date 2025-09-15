import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
import responseHandler from "./middleware/responseHandler.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import eventRouter from "./routes/event.route.js";
import userRouter from "./routes/user.route.js";
import orderRouter from "./routes/order.route.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

app.use(responseHandler);

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/event", eventRouter);
app.use("/orders", orderRouter);
app.use("/", (req, res) => {
  res.send("Api is running... this message is showing because the the entered route is not working. Solve the issues.");
});

app.use(errorHandler);

export default app;
