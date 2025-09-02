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
                Battleship(len=4) Remaining {`1`}
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
                Destroyer(len=3) Remaining {`2`}
              </label>
            </div>

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
            <Grid
              onCellClick={(row, col, isSelected) => {
                console.log(
                  `Player Grid - Cell ${row + 1}-${col + 1} ${isSelected ? "selected" : "deselected"} - Ship: ${selectedShipType}`
                );
              }}
            />
          </div>

          <div className={styles.gridSection}>
            <h2>Enemy Grid</h2>
            <p>Attack enemy ships (click to target)</p>

            <Grid
              onCellClick={(row, col, isSelected) => {
                console.log(
                  `Enemy Grid - Cell ${row + 1}-${col + 1} ${isSelected ? "selected" : "deselected"}`
                );
              }}
            />
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
