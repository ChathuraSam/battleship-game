// "use client";

// import { Button } from "@repo/ui/button";
// import { Grid } from "@repo/ui/grid";
// import { useEffect, useState } from "react";
// import { socket } from "../socket";

// export default function Home() {
//   const [selectedShipType, setSelectedShipType] = useState<
//     "battleship" | "destroyer"
//   >("battleship");

//   const [selectedOrientationType, setSelectedOrientationType] = useState<
//     "vertical" | "horizontal"
//   >("vertical");

//   const [noOfBattleshipsRemain, setNoOfBattleshipsRemain] = useState<number>(1);
//   const [noOfDestroyersRemain, setNoOfDestroyersRemain] = useState<number>(2);
//   const [shotsFired, setShotsFired] = useState<number>(0);

//   const [isConnected, setIsConnected] = useState(false);
//   const [transport, setTransport] = useState("N/A");
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   useEffect(() => {
//     function onConnect() {
//       console.log("Connected to server");
//       setIsConnected(true);
//       setConnectionError(null);
//       setTransport(socket.io.engine.transport.name);

//       socket.io.engine.on("upgrade", (transport) => {
//         console.log("Transport upgraded to:", transport.name);
//         setTransport(transport.name);
//       });

//       socket.io.engine.on("upgradeError", (error) => {
//         console.error("Transport upgrade error:", error);
//         setConnectionError(`Transport upgrade failed: ${error.message}`);
//       });
//     }

//     function onDisconnect(reason: string) {
//       console.log("Disconnected from server:", reason);
//       setIsConnected(false);
//       setTransport("N/A");

//       // Handle specific disconnect reasons
//       if (reason === "transport error") {
//         setConnectionError("Transport connection failed");
//       } else if (reason === "transport close") {
//         setConnectionError("Transport was closed");
//       }
//     }

//     function onConnectError(error: Error) {
//       console.error("Connection error:", error);
//       setConnectionError(error.message);
//       setIsConnected(false);
//     }

//     function onReconnect(attemptNumber: number) {
//       console.log("Reconnected after", attemptNumber, "attempts");
//       setConnectionError(null);
//     }

//     function onReconnectError(error: Error) {
//       console.error("Reconnection error:", error);
//       setConnectionError(`Reconnection failed: ${error.message}`);
//     }

//     // Add event listeners
//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);
//     socket.on("connect_error", onConnectError);
//     socket.on("reconnect", onReconnect);
//     socket.on("reconnect_error", onReconnectError);

//     // Connect the socket
//     if (!socket.connected) {
//       socket.connect();
//     }

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//       socket.off("connect_error", onConnectError);
//       socket.off("reconnect", onReconnect);
//       socket.off("reconnect_error", onReconnectError);

//       // Disconnect when component unmounts
//       if (socket.connected) {
//         socket.disconnect();
//       }
//     };
//   }, []);
//   const handleShipPlacement = (
//     shipCells: Array<{ row: number; col: number }>,
//     shipType: string
//   ) => {
//     console.log(`Placed ${shipType} at cells:`, shipCells);

//     // Update the remaining ship counts
//     if (shipType === "battleship") {
//       setNoOfBattleshipsRemain((prev) => Math.max(0, prev - 1));
//     } else if (shipType === "destroyer") {
//       setNoOfDestroyersRemain((prev) => Math.max(0, prev - 1));
//     }
//   };

//   const handleShipRemoval = (
//     shipType: string,
//     shipCells: Array<{ row: number; col: number }>
//   ) => {
//     console.log(`Removed ${shipType} from cells:`, shipCells);

//     // Update the remaining ship counts when ship is removed
//     if (shipType === "battleship") {
//       setNoOfBattleshipsRemain((prev) => prev + 1);
//     } else if (shipType === "destroyer") {
//       setNoOfDestroyersRemain((prev) => prev + 1);
//     }
//   };

//   const canPlaceShip = () => {
//     if (selectedShipType === "battleship") {
//       return noOfBattleshipsRemain > 0;
//     } else {
//       return noOfDestroyersRemain > 0;
//     }
//   };

//   const resetAllShips = () => {
//     setNoOfBattleshipsRemain(1);
//     setNoOfDestroyersRemain(2);
//     setShotsFired(0);
//     // Force grid reset by key change would be ideal, but for now this works
//     window.location.reload();
//   };

//   const allShipsPlaced =
//     noOfBattleshipsRemain === 0 && noOfDestroyersRemain === 0;

//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 sm:p-20 gap-16 font-sans">
//       <div className="text-center">
//         <p>Status: {isConnected ? "connected" : "disconnected"}</p>
//         <p>Transport: {transport}</p>
//         {connectionError && (
//           <p className="text-red-500 text-sm mt-2">Error: {connectionError}</p>
//         )}
//       </div>
//       <main className="flex flex-col gap-8 row-start-2 items-start sm:items-center">
//         <Button appName="web">Open alert</Button>
//         <div className="flex flex-row gap-8 items-start justify-center flex-wrap w-full lg:flex-col lg:items-center lg:gap-4">
//           <div className="flex flex-col items-center mt-8 lg:mt-4">
//             <h2 className="mb-2 text-2xl text-center font-bold">Player Grid</h2>
//             <p className="mb-4 text-gray-600 dark:text-gray-400 text-center text-sm">
//               Your ships (click to place/remove)
//             </p>
//             <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="shipType"
//                   value="battleship"
//                   checked={selectedShipType === "battleship"}
//                   onChange={(e) =>
//                     setSelectedShipType(e.target.value as "battleship")
//                   }
//                   className="mr-2"
//                 />
//                 <span className="text-gray-700">
//                   Battleship(len=4) Remaining {noOfBattleshipsRemain}
//                 </span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="shipType"
//                   value="destroyer"
//                   checked={selectedShipType === "destroyer"}
//                   onChange={(e) =>
//                     setSelectedShipType(e.target.value as "destroyer")
//                   }
//                   className="mr-2"
//                 />
//                 <span className="text-sm">
//                   Destroyer(len=3) Remaining {noOfDestroyersRemain}
//                 </span>
//               </label>
//             </div>

//             {!canPlaceShip() && (
//               <div className="text-red-600 mb-4 font-bold text-center">
//                 No more {selectedShipType}s available to place!
//               </div>
//             )}

//             {canPlaceShip() && (
//               <div className="text-green-600 mb-4 font-bold text-center">
//                 Click on the grid to place a {selectedShipType} (
//                 {selectedShipType === "battleship" ? "4" : "3"} cells,{" "}
//                 {selectedOrientationType})
//               </div>
//             )}

//             <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="shipOrientation"
//                   value="vertical"
//                   checked={selectedOrientationType === "vertical"}
//                   onChange={(e) =>
//                     setSelectedOrientationType(e.target.value as "vertical")
//                   }
//                   className="mr-2"
//                 />
//                 <span className="text-sm">Vertical</span>
//               </label>
//               <label className="flex items-center">
//                 <input
//                   type="radio"
//                   name="shipOrientation"
//                   value="horizontal"
//                   checked={selectedOrientationType === "horizontal"}
//                   onChange={(e) =>
//                     setSelectedOrientationType(e.target.value as "horizontal")
//                   }
//                   className="mr-2"
//                 />
//                 <span className="text-sm">Horizontal</span>
//               </label>
//             </div>

//             {allShipsPlaced && (
//               <div className="text-green-600 text-center mb-4">
//                 <div className="mb-2">All ships placed! Ready for battle!</div>
//                 <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
//                   READY
//                 </button>
//               </div>
//             )}

//             <div className="mb-4">
//               <button
//                 onClick={resetAllShips}
//                 className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
//               >
//                 Reset All Ships
//               </button>
//             </div>

//             <Grid
//               className="border-2 border-gray-400"
//               shipType={canPlaceShip() ? selectedShipType : undefined}
//               orientation={selectedOrientationType}
//               onShipPlacement={handleShipPlacement}
//               onShipRemoval={handleShipRemoval}
//               onCellClick={(row, col, isSelected) => {
//                 console.log(
//                   `Player Grid - Cell ${row + 1}-${col + 1} ${isSelected ? "selected" : "deselected"}`
//                 );
//               }}
//             />
//           </div>

//           <div className="flex flex-col items-center mt-8 lg:mt-4">
//             <h2 className="mb-2 text-2xl text-center font-bold">Enemy Grid</h2>
//             <p className="mb-4 text-gray-600 dark:text-gray-400 text-center text-sm">
//               Attack enemy ships (click to target)
//             </p>
//             <div className="mb-4 font-bold text-center">
//               Shots fired: {shotsFired}
//             </div>

//             <Grid
//               mode="targeting"
//               className="border-2 border-gray-400"
//               onCellClick={(row, col, isTargeted) => {
//                 console.log(
//                   `Enemy Grid - Cell ${row + 1}-${col + 1} ${isTargeted ? "targeted" : "untargeted"}`
//                 );
//                 // Update shots counter
//                 if (isTargeted) {
//                   setShotsFired((prev) => prev + 1);
//                 } else {
//                   setShotsFired((prev) => Math.max(0, prev - 1));
//                 }
//               }}
//             />
//           </div>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         {/* Footer content can go here */}
//       </footer>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import useSocket from "../hooks/useSocket";

export default function GamePage() {
  // const player1Id = "23ff0250-0cf0-4084-b1ce-bd3aacf5628a";
  // const player2Id = "5e7c5101-7c90-4437-b935-a225d73ea920";

  const [gameId, setGameId] = useState("e5c5a429-9fb9-41f9-be67-4b04229d9792");
  const [playerId, setPlayerId] = useState(
    "23ff0250-0cf0-4084-b1ce-bd3aacf5628a"
  );
  const [isGameStarted, setIsGameStarted] = useState(true);

  const [moves, setMoves] = useState<
    { x: number; y: number; from: "me" | "opponent" }[]
  >([]);

  const { makeMove } = useSocket(playerId as string, (move) => {
    setMoves((prev) => [...prev, { ...move, from: "opponent" }]);
  });

  const handleClick = () => {
    console.log("*** handle click run");
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    makeMove(x, y);
    setMoves((prev) => [...prev, { x, y, from: "me" }]);
  };

  const handleJoinGame = () => {
    if (playerId.trim() && gameId.trim()) {
      setIsGameStarted(true);
    } else {
      alert("Please enter both Player ID and Game ID");
    }
  };

  const handleLeaveGame = () => {
    setIsGameStarted(false);
    setMoves([]);
  };

  if (!isGameStarted) {
    return (
      <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
        <h1>Join Battleship Game</h1>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="playerId"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Player ID:
          </label>
          <input
            id="playerId"
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter your player ID"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="gameId"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Game ID:
          </label>
          <input
            id="gameId"
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter game ID"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          onClick={handleJoinGame}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Join Game
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1>Battleship Game</h1>
        <p>Player ID: {playerId}</p>
        <p>Game ID: {gameId}</p>
        <button
          onClick={handleLeaveGame}
          style={{
            padding: "5px 10px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Leave Game
        </button>
      </div>

      <button
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Make Random Move
      </button>

      <div>
        <h3>Moves:</h3>
        <ul>
          {moves.map((m, i) => (
            <li key={i}>
              {m.from}: ({m.x}, {m.y})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
