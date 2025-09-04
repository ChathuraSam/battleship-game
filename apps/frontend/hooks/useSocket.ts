import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext";

interface Move {
  x: number;
  y: number;
}

interface MoveResult {
  hit: boolean;
  coordinates: [number, number];
  shipName: string | null;
  isShipSunk: boolean;
  isGameOver: boolean;
  attackingPlayerId: string;
  opponentPlayerId: string;
  gameId: string;
  opponentBoard: {
    hits: number[][];
    misses: number[][];
  };
  isYourTurn?: boolean;
}

interface GameOverResult {
  winner: string;
  loser: string;
  message: string;
}

type OnOpponentMove = (move: Move) => void;
type OnMoveResult = (result: MoveResult) => void;
type OnGameOver = (result: GameOverResult) => void;
type OnError = (error: { message: string }) => void;

export default function useSocket(
  playerId: string,
  onOpponentMove?: OnOpponentMove,
  onMoveResult?: OnMoveResult,
  onGameOver?: OnGameOver,
  onError?: OnError
) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Handle opponent's move (when they attack your board)
    socket.on("opponentMove", (result: MoveResult) => {
      console.log("Opponent attacked your board:", result);
      if (onOpponentMove) {
        onOpponentMove({ x: result.coordinates[0], y: result.coordinates[1] });
      }
      if (onMoveResult) {
        onMoveResult(result);
      }
    });

    // Handle your move result (when you attack opponent's board)
    socket.on("moveResult", (result: MoveResult) => {
      console.log("Your attack result:", result);
      if (onMoveResult) {
        onMoveResult(result);
      }
    });

    // Handle game over
    socket.on("gameOver", (result: GameOverResult) => {
      console.log("Game over:", result);
      if (onGameOver) {
        onGameOver(result);
      }
    });

    // Handle errors
    socket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
      if (onError) {
        onError(error);
      }
    });

    // Handle ship placement confirmation
    socket.on("shipsPlaced", (data: { playerId: string; success: boolean }) => {
      console.log("Ships placed successfully:", data);
    });

    // Handle when opponent is ready
    socket.on("playerReady", (data: { playerId: string }) => {
      console.log("Player ready:", data);
    });

    return () => {
      socket.off("opponentMove");
      socket.off("moveResult");
      socket.off("gameOver");
      socket.off("error");
      socket.off("shipsPlaced");
      socket.off("playerReady");
      socket.off("playerJoined");
    };
  }, [socket, playerId, onOpponentMove, onMoveResult, onGameOver, onError]);

  const makeMove = (x: number, y: number) => {
    console.log("Making move:", { playerId, x, y });
    if (!socket) {
      console.warn("Socket not connected yet, cannot make move");
      return;
    }
    socket.emit("makeMove", { playerId, x, y });
  };

  const joinGame = (gameId: string, playerId: string) => {
    console.log(`Player ${playerId} joining gameId ${gameId}`);
    if (!socket) {
      console.warn("Socket not connected yet, cannot join game");
      return;
    }
    socket.emit("joinGame", { gameId, playerId });
  };

  const placeShips = (playerId: string, ships: object) => {
    console.log(`Player ${playerId} placing ships:`, ships);
    if (!socket) {
      console.warn("Socket not connected yet, cannot place ships");
      return;
    }
    socket.emit("placeShips", { playerId, ships });
  };

  return { makeMove, joinGame, placeShips };
}
