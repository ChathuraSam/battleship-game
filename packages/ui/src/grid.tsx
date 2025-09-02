"use client";

import { useState } from "react";

interface GridProps {
  className?: string;
  size?: number;
  onCellClick?: (row: number, col: number, isSelected: boolean) => void;
  shipType?: "battleship" | "destroyer";
  orientation?: "vertical" | "horizontal";
  onShipPlacement?: (
    shipCells: Array<{ row: number; col: number }>,
    shipType: string
  ) => void;
  onShipRemoval?: (
    shipType: string,
    shipCells: Array<{ row: number; col: number }>
  ) => void;
}

interface CellState {
  isSelected: boolean;
  shipType?: "battleship" | "destroyer";
  shipId?: string;
}

export const Grid = ({
  className = "",
  size = 10,
  onCellClick,
  shipType,
  orientation = "horizontal",
  onShipPlacement,
  onShipRemoval,
}: GridProps) => {
  const [cellStates, setCellStates] = useState<CellState[][]>(() =>
    Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ isSelected: false }))
      )
  );

  const getShipLength = (type: string) => {
    return type === "battleship" ? 4 : 3;
  };

  const canPlaceShip = (
    row: number,
    col: number,
    shipLength: number,
    orientation: string
  ): boolean => {
    if (orientation === "horizontal") {
      // Check if ship fits horizontally
      if (col + shipLength > size) return false;

      // Check if any cell is already occupied
      for (let i = 0; i < shipLength; i++) {
        const cell = cellStates[row]?.[col + i];
        if (!cell || cell.isSelected) return false;
      }
    } else {
      // Check if ship fits vertically
      if (row + shipLength > size) return false;

      // Check if any cell is already occupied
      for (let i = 0; i < shipLength; i++) {
        const cell = cellStates[row + i]?.[col];
        if (!cell || cell.isSelected) return false;
      }
    }
    return true;
  };

  const removeShip = (row: number, col: number) => {
    const clickedCell = cellStates[row]?.[col];
    if (!clickedCell?.isSelected || !clickedCell.shipId) return;

    const shipId = clickedCell.shipId;
    const removedShipType = clickedCell.shipType;
    const removedCells: Array<{ row: number; col: number }> = [];

    setCellStates((prevStates) => {
      const newStates = prevStates.map((rowStates) =>
        rowStates.map((cell) => ({ ...cell }))
      );

      // Remove all cells with the same shipId and collect their positions
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = newStates[r]?.[c];
          if (cell?.shipId === shipId) {
            removedCells.push({ row: r, col: c });
            newStates[r]![c] = { isSelected: false };
          }
        }
      }

      return newStates;
    });

    // Notify about ship removal
    if (onShipRemoval && removedShipType) {
      onShipRemoval(removedShipType, removedCells);
    }
  };

  const placeShip = (
    row: number,
    col: number,
    shipLength: number,
    orientation: string,
    shipType: string
  ) => {
    const shipId = `${shipType}-${Date.now()}-${Math.random()}`;
    const shipCells: Array<{ row: number; col: number }> = [];

    setCellStates((prevStates) => {
      const newStates = prevStates.map((rowStates) =>
        rowStates.map((cell) => ({ ...cell }))
      );

      if (orientation === "horizontal") {
        for (let i = 0; i < shipLength; i++) {
          const cell = newStates[row]?.[col + i];
          if (cell) {
            newStates[row]![col + i] = {
              isSelected: true,
              shipType: shipType as "battleship" | "destroyer",
              shipId,
            };
            shipCells.push({ row, col: col + i });
          }
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          const cell = newStates[row + i]?.[col];
          if (cell) {
            newStates[row + i]![col] = {
              isSelected: true,
              shipType: shipType as "battleship" | "destroyer",
              shipId,
            };
            shipCells.push({ row: row + i, col });
          }
        }
      }

      return newStates;
    });

    if (onShipPlacement) {
      onShipPlacement(shipCells, shipType);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    console.log(`Clicking cell ${row}-${col}`);

    const currentCell = cellStates[row]?.[col];
    if (!currentCell) return;

    // If cell is already selected, remove the ship
    if (currentCell.isSelected) {
      removeShip(row, col);
      if (onCellClick) {
        onCellClick(row, col, false);
      }
      return;
    }

    // If shipType is provided, try to place a ship
    if (shipType) {
      const shipLength = getShipLength(shipType);

      if (canPlaceShip(row, col, shipLength, orientation)) {
        placeShip(row, col, shipLength, orientation, shipType);
        if (onCellClick) {
          onCellClick(row, col, true);
        }
      } else {
        console.log(
          "Cannot place ship here - not enough space or cells occupied"
        );
      }
    } else {
      // Simple cell toggle if no ship type specified
      setCellStates((prevStates) => {
        const newStates = prevStates.map((rowStates) => [...rowStates]);
        const cell = newStates[row]?.[col];
        if (!cell) return prevStates;

        cell.isSelected = !cell.isSelected;
        return newStates;
      });

      if (onCellClick) {
        onCellClick(row, col, !currentCell.isSelected);
      }
    }
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
    gap: "1px",
    width: "400px",
    height: "400px",
    border: "2px solid #333",
    backgroundColor: "#333",
  };

  const cellStyle = (cell: CellState) => {
    let backgroundColor = "#f3f4f6"; // Default empty cell color
    let color = "#6b7280";

    if (cell.isSelected) {
      if (cell.shipType === "battleship") {
        backgroundColor = "#dc2626"; // Red for battleship
        color = "white";
      } else if (cell.shipType === "destroyer") {
        backgroundColor = "#2563eb"; // Blue for destroyer
        color = "white";
      } else {
        backgroundColor = "#ef4444"; // Default red for selected
        color = "white";
      }
    }

    return {
      backgroundColor,
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold",
      color,
      "&:hover": {
        opacity: 0.8,
      },
    };
  };

  return (
    <div className={`grid-container ${className}`}>
      <div style={gridStyle}>
        {cellStates.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              style={cellStyle(cell)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              aria-label={`Cell ${rowIndex + 1}-${colIndex + 1}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to reset grid state
export const useGridReset = (size: number = 10) => {
  const createEmptyGrid = () =>
    Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ isSelected: false }))
      );

  return { createEmptyGrid };
};
