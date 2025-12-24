import React from 'react';

/**
 * PUBLIC_INTERFACE
 * GameBoard displays a 3x3 grid placeholder without gameplay logic.
 */
export default function GameBoard() {
  const cells = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div className="surface-card board-wrapper" aria-label="Tic Tac Toe board area">
      <div className="board" role="grid" aria-label="3 by 3 board">
        {cells.map((idx) => (
          <div
            key={idx}
            role="gridcell"
            aria-label={`Cell ${idx + 1}`}
            className="cell cell-placeholder"
          >
            {/* Placeholder mark to hint clickability */}
            +
          </div>
        ))}
      </div>
    </div>
  );
}
