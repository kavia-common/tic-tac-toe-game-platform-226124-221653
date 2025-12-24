import React from 'react';

/**
 * PUBLIC_INTERFACE
 * MoveList lists chronological moves for the current game.
 * It expects moves to be an array of objects like { moveNumber, player, position }.
 */
export default function MoveList({ moves }) {
  if (!moves || moves.length === 0) {
    return (
      <div className="meta">No moves yet. Make the first move to begin!</div>
    );
  }

  return (
    <ol className="move-list" aria-label="Move List">
      {moves.map((m, idx) => {
        const display = `#${m.moveNumber ?? idx + 1} - ${m.player} to ${formatPos(
          m.position
        )}`;
        return (
          <li key={`${m.moveNumber ?? idx}-${m.position}`} className="move-item">
            <span className="move-dot" aria-hidden="true" />
            <span className="move-text">{display}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Convert position (0-8) to human-friendly row/col.
 */
function formatPos(p) {
  if (typeof p !== 'number') return '?';
  const row = Math.floor(p / 3) + 1;
  const col = (p % 3) + 1;
  return `row ${row}, col ${col}`;
}
