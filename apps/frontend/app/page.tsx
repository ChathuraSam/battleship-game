"use client";

import { Button } from "@repo/ui/button";
import { Grid } from "@repo/ui/grid";
import { useState } from "react";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <main className={styles.main}>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>
        <div className={styles.gridsContainer}>
          <div className={styles.gridSection}>
            <h2>Player Grid</h2>
            <p>Your ships (click to place/remove)</p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>
                <input
                  type="radio"
                  name="shipType"
                  value="battleship"
                  checked={selectedShipType === "battleship"}
                  onChange={(e) =>
                    setSelectedShipType(e.target.value as "battleship")
                  }
                  style={{ marginRight: "0.5rem" }}
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
                  style={{ marginRight: "0.5rem" }}
                />
                Destroyer(len=3) Remaining {noOfDestroyersRemain}
              </label>
            </div>

            {!canPlaceShip() && (
              <div
                style={{
                  color: "#dc2626",
                  marginBottom: "1rem",
                  fontWeight: "bold",
                }}
              >
                No more {selectedShipType}s available to place!
              </div>
            )}

            {canPlaceShip() && (
              <div
                style={{
                  color: "#059669",
                  marginBottom: "1rem",
                  fontWeight: "bold",
                }}
              >
                Click on the grid to place a {selectedShipType} (
                {selectedShipType === "battleship" ? "4" : "3"} cells,{" "}
                {selectedOrientationType})
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ marginRight: "1rem" }}>
                <input
                  type="radio"
                  name="shipOrientation"
                  value="vertical"
                  checked={selectedOrientationType === "vertical"}
                  onChange={(e) =>
                    setSelectedOrientationType(e.target.value as "vertical")
                  }
                  style={{ marginRight: "0.5rem" }}
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
                  style={{ marginRight: "0.5rem" }}
                />
                Horizontal
              </label>
            </div>

            {allShipsPlaced && (
              <div
                style={{
                  color: "#059669",
                }}
              >
                All ships placed! Ready for battle!
                <button>READY</button>
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <button onClick={resetAllShips}>Reset All Ships</button>
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

          <div className={styles.gridSection}>
            <h2>Enemy Grid</h2>
            <p>Attack enemy ships (click to target)</p>
            <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
              Shots fired: {shotsFired}
            </div>

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
      <footer className={styles.footer}></footer>
    </div>
  );
}
