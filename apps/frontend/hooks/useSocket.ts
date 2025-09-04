import { useEffect } from "react";
import { useSocketContext } from "../contexts/SocketContext";

interface Move {
  x: number;
  y: number;
}

type OnOpponentMove = (move: Move) => void;

export default function useSocket(
  playerId: string,
  onOpponentMove?: OnOpponentMove
) {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    socket.on("opponentMove", (move: Move) => {
      if (onOpponentMove) onOpponentMove(move);
    });

    return () => {
      socket.off("playerJoined");
      socket.off("opponentMove");
    };
  }, [socket, playerId, onOpponentMove]);

  const makeMove = (x: number, y: number) => {
    console.log("Make move***", { playerId });
    if (!socket) {
      console.warn("Socket not connected yet, cannot make move");
      return;
    }
    socket.emit("makeMove", { playerId, x, y });
  };

  const joinGame = (gameId: string, playerId: string) => {
    console.log(`Player ${playerId} joining gameId ${gameId}`);
    if (!socket) {
      console.warn("Socket not connected yet, cannot make move");
      return;
    }
    socket.emit("joinGame", { gameId, playerId });
  };

  const placeShips = (playerId: string, ships: object) => {
    console.log(`Player ${playerId} ship data: ${ships}`);
    if (!socket) {
      console.warn("Socket not connected yet, cannot make move");
      return;
    }
    socket.emit("placeShips", { playerId, ships });
  };

  return { makeMove, joinGame, placeShips };
}
