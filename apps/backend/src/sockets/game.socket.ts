import { Server, Socket } from "socket.io";
import { GameService } from "../services/game.service";

const gameService = new GameService();

export function registerGameHandlers(io: Server, socket: Socket) {
  // Player makes a move
  socket.on("makeMove", async ({ playerId, x, y }) => {
    try {
      const result = await gameService.makeMove(playerId, x, y);

      // Get the attacking player data to find the game room
      const gameService2 = new GameService();
      const attackingPlayerData = await gameService2.getPlayerData(playerId);
      const gameId = attackingPlayerData?.gameId;

      if (gameId) {
        // Notify the attacking player of the result
        socket.emit("moveResult", {
          ...result,
          isYourTurn: false, // It's now opponent's turn after the move
        });

        // Notify the opponent about the attack on their board
        socket.to(gameId).emit("opponentMove", {
          ...result,
          isYourTurn: true, // It's now their turn to attack
        });

        // If game is over, notify both players
        if (result.isGameOver) {
          io.to(gameId).emit("gameOver", {
            winner: playerId,
            loser: result.opponentPlayerId,
            message: "All ships have been sunk!",
          });
        }
      }
    } catch (error: any) {
      socket.emit("error", { message: error.message });
      console.error("Error in makeMove:", error);
    }
  });

  // Player joins a game room
  socket.on("joinGame", async ({ gameId, playerId }) => {
    try {
      socket.join(gameId);
      const result = await gameService.joinGame(gameId, playerId);

      // Notify all players in the game room about the new player
      io.to(gameId).emit("playerJoined", {
        playerId,
        socketId: socket.id,
        playerData: result,
      });

      console.log(`Player ${playerId} joined game ${gameId}`);
    } catch (error: any) {
      socket.emit("error", { message: error.message });
      console.error("Error in joinGame:", error);
    }
  });

  // Player places ships
  socket.on("placeShips", async ({ playerId, ships }) => {
    try {
      const result = await gameService.placeShips(playerId, ships);

      // Get player data to find game room
      const gameService2 = new GameService();
      const playerData = await gameService2.getPlayerData(playerId);
      const gameId = playerData?.gameId;

      if (gameId) {
        // Notify the player who placed ships
        socket.emit("shipsPlaced", { playerId, success: true });

        // Notify other players in the game that this player is ready
        socket.to(gameId).emit("playerReady", { playerId });

        console.log(`Player ${playerId} placed ships in game ${gameId}`);
      }
    } catch (error: any) {
      socket.emit("error", { message: error.message });
      console.error("Error in placeShips:", error);
    }
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
}
