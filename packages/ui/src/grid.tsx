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
  mode?: "ship-placement" | "targeting"; // New prop to differentiate grid modes
}

interface CellState {
  isSelected: boolean;
  shipType?: "battleship" | "destroyer";
  shipId?: string;
  isTargeted?: boolean; // New property for enemy grid targeting
}

export const Grid = ({
  className = "",
  size = 10,
  onCellClick,
  shipType,
  orientation = "horizontal",
  onShipPlacement,
  onShipRemoval,
  mode = "ship-placement", // Default to ship placement mode
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

    // Handle targeting mode (enemy grid)
    if (mode === "targeting") {
      setCellStates((prevStates) => {
        const newStates = prevStates.map((rowStates) =>
          rowStates.map((cell) => ({ ...cell }))
        );
        const cell = newStates[row]?.[col];
        if (!cell) return prevStates;

        // Toggle targeted state
        cell.isTargeted = !cell.isTargeted;
        return newStates;
      });

      if (onCellClick) {
        onCellClick(row, col, !currentCell.isTargeted);
      }
      return;
    }

    // Handle ship placement mode (player grid)
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

  const getCellClassName = (cell: CellState): string => {
    let classes =
      "w-full h-full cursor-pointer flex items-center justify-center text-xs font-bold border";

    // Handle targeting mode (enemy grid)
    if (mode === "targeting") {
      if (cell.isTargeted) {
        classes += " bg-yellow-400 text-black border-yellow-600"; // Yellow for targeted
      } else {
        classes += " bg-blue-100 text-gray-800 border-gray-400"; // Light blue for untargeted
      }
      return classes;
    }

    // Handle ship placement mode (player grid)
    if (cell.isSelected) {
      if (cell.shipType === "battleship") {
        classes += " bg-red-600 text-white border-red-800"; // Red for battleship
      } else if (cell.shipType === "destroyer") {
        classes += " bg-blue-600 text-white border-blue-800"; // Blue for destroyer
      } else {
        classes += " bg-red-500 text-white border-red-700"; // Default red for selected
      }
    } else {
      classes += " bg-gray-100 text-gray-800 border-gray-400"; // Light gray for unselected
    }

    return classes;
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className="grid border-4 border-black bg-gray-800 p-1"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
          width: "320px",
          height: "320px",
          gap: "2px",
        }}
      >
        {cellStates.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(cell)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              aria-label={`Cell ${rowIndex + 1}-${colIndex + 1}`}
              style={{
                minHeight: "25px",
                minWidth: "25px",
              }}
            >
              {mode === "targeting" && cell.isTargeted ? "●" : ""}
            </button>
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
