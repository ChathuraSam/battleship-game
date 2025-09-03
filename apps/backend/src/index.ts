import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { router as gameRouter } from "./routes/game";
import { router as healthRouter } from "./routes/health";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import http from "http";

// // Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Add basic CORS and JSON middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
const PORT = process.env.PORT || 3001;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // force websocket, avoid polling
});

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinGame", (gameId: string) => {
    socket.join(gameId);
    console.log(`User ${socket.id} joined game ${gameId}`);
    socket.to(gameId).emit("playerJoined", { playerId: socket.id });
  });

  socket.on("makeMove", ({ gameId, x, y }) => {
    socket.to(gameId).emit("opponentMove", { x, y });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/game", gameRouter);

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Battleship Game API",
    version: "1.0.0",
    status: "running",
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

server.listen(PORT, () => {
  console.log("Socket.IO server running on port 3001");
  console.log(
    `🚀 Battleship Game API server running on http://localhost:${PORT}`
  );
  console.log(`📖 Environment: ${process.env.NODE_ENV || "development"}`);
});
