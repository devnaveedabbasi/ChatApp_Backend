import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({ path: "./.env" });
import { Server } from "socket.io";
import http, { createServer } from 'http'
export const app = express();
export const server=createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: false,
  }
});

app.set('io', io);


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});


handleSocket(io)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://172.30.160.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());




// Routes
import userRoutes from "./routes/auth.route.js";
import messageRoute from './routes/message.route.js'
import friend from './routes/friend.route.js'
app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);
app.use("/api/friend", friend);


import errorHandler from "./middlewears/errorHandler.js";
import handleSocket from "./utlis/handleOnlineUsers.js";
app.use(errorHandler);