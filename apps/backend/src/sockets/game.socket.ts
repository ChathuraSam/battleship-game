import { Server, Socket } from "socket.io";
import { GameService } from "../services/game.service";

const gameService = new GameService();

export function registerGameHandlers(io: Server, socket: Socket) {
  // Player makes a move
  socket.on("makeMove", async ({ playerId, x, y }) => {
    try {
      const result = await gameService.makeMove(playerId, x, y);

      // Notify this player of result
      socket.emit("moveResult", result);

      // Notify other players in the same game room
      socket.to(playerId).emit("opponentMove", result);
    } catch (error: any) {
      socket.emit("error", { message: error.message });
    }
  });

  // Player joins a game room
  socket.on("joinGame", ({ gameId, playerId }) => {
    socket.join(gameId);
    const result = gameService.joinGame(gameId, playerId);
    io.to(gameId).emit("playerJoined", { playerId: socket.id });
  });

  // Player joins a game room
  socket.on("placeShips", ({ playerId, ships }) => {
    // socket.join(gameId);
    const result = gameService.placeShips(playerId, ships);
    console.log("ships placed in the database");
    io.to(playerId).emit("shipsPlaces", { playerId });
  });
}
