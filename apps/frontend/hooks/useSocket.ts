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

    socket.emit("joinGame", playerId);

    socket.on("playerJoined", (data) => {
      console.log("Another player joined:", data);
    });

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

  return { makeMove };
}
