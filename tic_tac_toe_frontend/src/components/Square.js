import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Square is a single cell button used in the 3x3 grid.
 * It renders as a button for accessibility and handles disabled states.
 */
export default function Square({ value, onClick, disabled, index }) {
  const ariaLabel = value
    ? `Cell ${index + 1}, contains ${value}`
    : `Cell ${index + 1}, empty`;

  const hasValue = value === 'X' || value === 'O';

  return (
    <button
      type="button"
      className={`cell ${!hasValue ? 'cell-empty' : ''}`}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      {hasValue ? value : ''}
    </button>
  );
}
