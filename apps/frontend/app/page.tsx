"use client";

import { Button } from "@repo/ui/button";
import { Grid } from "@repo/ui/grid";
import { useState } from "react";

export default function Home() {
  const [selectedShipType, setSelectedShipType] = useState<
    "battleship" | "destroyer"
  >("battleship");

  const [selectedOrientationType, setSelectedOrientationType] = useState<
    "vertical" | "horizontal"
  >("vertical");

  const [noOfBattleshipsRemain, setNoOfBattleshipsRemain] = useState<number>(1);
  const [noOfDestroyersRemain, setNoOfDestroyersRemain] = useState<number>(2);
  const [shotsFired, setShotsFired] = useState<number>(0);

  const handleShipPlacement = (
    shipCells: Array<{ row: number; col: number }>,
    shipType: string
  ) => {
    console.log(`Placed ${shipType} at cells:`, shipCells);

    // Update the remaining ship counts
    if (shipType === "battleship") {
      setNoOfBattleshipsRemain((prev) => Math.max(0, prev - 1));
    } else if (shipType === "destroyer") {
      setNoOfDestroyersRemain((prev) => Math.max(0, prev - 1));
    }
  };

  const handleShipRemoval = (
    shipType: string,
    shipCells: Array<{ row: number; col: number }>
  ) => {
    console.log(`Removed ${shipType} from cells:`, shipCells);

    // Update the remaining ship counts when ship is removed
    if (shipType === "battleship") {
      setNoOfBattleshipsRemain((prev) => prev + 1);
    } else if (shipType === "destroyer") {
      setNoOfDestroyersRemain((prev) => prev + 1);
    }
  };

  const canPlaceShip = () => {
    if (selectedShipType === "battleship") {
      return noOfBattleshipsRemain > 0;
    } else {
      return noOfDestroyersRemain > 0;
    }
  };

  const resetAllShips = () => {
    setNoOfBattleshipsRemain(1);
    setNoOfDestroyersRemain(2);
    setShotsFired(0);
    // Force grid reset by key change would be ideal, but for now this works
    window.location.reload();
  };

  const allShipsPlaced =
    noOfBattleshipsRemain === 0 && noOfDestroyersRemain === 0;

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-20 gap-16 font-sans sm:p-8 sm:pb-20">
      <main className="flex flex-col gap-8 row-start-2 sm:items-center">
        <Button
          appName="web"
          className="appearance-none rounded-full h-12 px-5 border border-gray-200 dark:border-gray-800 transition-all cursor-pointer flex items-center justify-center text-base font-medium bg-transparent min-w-[180px] hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Open alert
        </Button>
        <div className="flex flex-row gap-8 items-start justify-center flex-wrap w-full md:flex-col md:items-center md:gap-4">
          <div className="flex flex-col items-center mt-8 md:mt-4">
            <h2 className="mb-2 text-2xl text-center">Player Grid</h2>
            <p className="mb-4 text-gray-600 text-center text-sm">
              Your ships (click to place/remove)
            </p>
            <div className="mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  name="shipType"
                  value="battleship"
                  checked={selectedShipType === "battleship"}
                  onChange={(e) =>
                    setSelectedShipType(e.target.value as "battleship")
                  }
                  className="mr-2"
                />
                Battleship(len=4) Remaining {noOfBattleshipsRemain}
              </label>
              <label>
                <input
                  type="radio"
                  name="shipType"
                  value="destroyer"
                  checked={selectedShipType === "destroyer"}
                  onChange={(e) =>
                    setSelectedShipType(e.target.value as "destroyer")
                  }
                  className="mr-2"
                />
                Destroyer(len=3) Remaining {noOfDestroyersRemain}
              </label>
            </div>

            {!canPlaceShip() && (
              <div className="text-red-600 mb-4 font-bold">
                No more {selectedShipType}s available to place!
              </div>
            )}

            {canPlaceShip() && (
              <div className="text-green-600 mb-4 font-bold">
                Click on the grid to place a {selectedShipType} (
                {selectedShipType === "battleship" ? "4" : "3"} cells,{" "}
                {selectedOrientationType})
              </div>
            )}

            <div className="mb-4">
              <label className="mr-4">
                <input
                  type="radio"
                  name="shipOrientation"
                  value="vertical"
                  checked={selectedOrientationType === "vertical"}
                  onChange={(e) =>
                    setSelectedOrientationType(e.target.value as "vertical")
                  }
                  className="mr-2"
                />
                Vertical
              </label>
              <label>
                <input
                  type="radio"
                  name="shipOrientation"
                  value="horizontal"
                  checked={selectedOrientationType === "horizontal"}
                  onChange={(e) =>
                    setSelectedOrientationType(e.target.value as "horizontal")
                  }
                  className="mr-2"
                />
                Horizontal
              </label>
            </div>

            {allShipsPlaced && (
              <div className="text-green-600">
                All ships placed! Ready for battle!
                <button className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                  READY
                </button>
              </div>
            )}

            <div className="mb-4">
              <button
                onClick={resetAllShips}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Reset All Ships
              </button>
            </div>
            <Grid
              shipType={canPlaceShip() ? selectedShipType : undefined}
              orientation={selectedOrientationType}
              onShipPlacement={handleShipPlacement}
              onShipRemoval={handleShipRemoval}
              onCellClick={(row, col, isSelected) => {
                console.log(
                  `Player Grid - Cell ${row + 1}-${col + 1} ${isSelected ? "selected" : "deselected"}`
                );
              }}
            />
          </div>

          <div className="flex flex-col items-center mt-8 md:mt-4">
            <h2 className="mb-2 text-2xl text-center">Enemy Grid</h2>
            <p className="mb-4 text-gray-600 text-center text-sm">
              Attack enemy ships (click to target)
            </p>
            <div className="mb-4 font-bold">Shots fired: {shotsFired}</div>

            <Grid
              mode="targeting"
              onCellClick={(row, col, isTargeted) => {
                console.log(
                  `Enemy Grid - Cell ${row + 1}-${col + 1} ${isTargeted ? "targeted" : "untargeted"}`
                );
                // Update shots counter
                if (isTargeted) {
                  setShotsFired((prev) => prev + 1);
                } else {
                  setShotsFired((prev) => Math.max(0, prev - 1));
                }
              }}
            />
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6"></footer>
    </div>
  );
}
