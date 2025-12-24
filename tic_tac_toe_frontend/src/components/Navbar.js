import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Navbar renders the top navigation bar with brand and actions.
 */
export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      <div className="navbar-inner">
        <div className="brand" aria-label="Tic Tac Toe">
          <span className="brand-badge" aria-hidden="true" />
          <span>Ocean Tic Tac Toe</span>
        </div>
        <div className="nav-actions">
          <button className="btn" type="button" aria-label="How it works">How it works</button>
          <button className="btn btn-primary" type="button" aria-label="New Game">New Game</button>
        </div>
      </div>
    </nav>
  );
}
