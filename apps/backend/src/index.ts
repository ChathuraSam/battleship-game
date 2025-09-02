import express from "express";
import cors from "cors";
// import helmet from 'helmet';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import { router as gameRouter } from './routes/game';
// import { router as healthRouter } from './routes/health';

// // Load environment variables
// dotenv.config();

const app = express();
// const PORT = process.env.PORT || 3001;

// Add basic CORS and JSON middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(morgan('combined'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/health', healthRouter);
// app.use('/api/game', gameRouter);

// // Default route
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Battleship Game API',
//     version: '1.0.0',
//     status: 'running'
//   });
// });

// // Error handling middleware
// app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Something went wrong!',
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Battleship Game API server running on http://localhost:${PORT}`);
//   console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
// });

import { createServer } from "node:http";
import { Server } from "socket.io";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"], // Start with polling, then upgrade to websocket
  allowEIO3: true, // Allow Engine.IO v3 clients
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000, // Time to wait for websocket upgrade
  maxHttpBufferSize: 1e6, // 1 MB
  allowRequest: (req, callback) => {
    // Add additional validation if needed
    console.log("Connection request from:", req.headers.origin);
    callback(null, true);
  },
});

app.get("/", (req, res) => {
  res.send({ message: "hello" });
});

// Add middleware for debugging
io.engine.on("connection_error", (err) => {
  console.log("Engine.IO connection error:", err.req);
  console.log("Error code:", err.code);
  console.log("Error message:", err.message);
  console.log("Error context:", err.context);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  console.log("Transport:", socket.conn.transport.name);

  // Log transport upgrades
  socket.conn.on("upgrade", () => {
    console.log("Transport upgraded to:", socket.conn.transport.name);
  });

  // Handle connection errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Handle transport errors
  socket.conn.on("error", (error) => {
    console.error("Transport error for socket", socket.id, ":", error);
  });

  socket.on("message", (msg) => {
    console.log("Message received:", msg);
    io.emit("message", msg); // Broadcast message to all connected clients
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "Reason:", reason);
  });

  // Send a welcome message to the newly connected client
  socket.emit("welcome", {
    message: "Welcome to the battleship game!",
    id: socket.id,
  });
});

server.listen(3001, () => {
  console.log("server running at http://localhost:3001");
});
