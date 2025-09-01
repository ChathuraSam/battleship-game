"use client";

import { useState } from "react";

interface GridProps {
  className?: string;
  size?: number;
  onCellClick?: (row: number, col: number, isSelected: boolean) => void;
}

interface CellState {
  isSelected: boolean;
}

export const Grid = ({ className = "", size = 10, onCellClick }: GridProps) => {
  const [cellStates, setCellStates] = useState<CellState[][]>(() =>
    Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ isSelected: false }))
      )
  );

  const handleCellClick = (row: number, col: number) => {
    console.log(`Clicking cell ${row}-${col}`);

    // Get the current state first
    const currentCell = cellStates[row]?.[col];
    if (!currentCell) return;

    const currentState = currentCell.isSelected;
    const newState = !currentState;

    // Update the state
    setCellStates((prevStates) => {
      const newStates = prevStates.map((rowStates) => [...rowStates]);
      const cell = newStates[row]?.[col];
      if (!cell) return prevStates;

      cell.isSelected = newState;
      console.log(
        `Cell ${row}-${col} changing from ${currentState} to ${newState}`
      );

      return newStates;
    });

    // Call the callback outside of setState to avoid double execution
    if (onCellClick) {
      onCellClick(row, col, newState);
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

  const cellStyle = (isSelected: boolean) => ({
    backgroundColor: isSelected ? "#ef4444" : "#f3f4f6",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    color: isSelected ? "white" : "#6b7280",
  });

  return (
    <div className={`grid-container ${className}`}>
      <div style={gridStyle}>
        {cellStates.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              style={cellStyle(cell.isSelected)}
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
