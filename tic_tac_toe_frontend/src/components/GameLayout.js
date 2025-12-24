import React from 'react';
import GameBoard from './GameBoard';
import Sidebar from './Sidebar';

/**
 * PUBLIC_INTERFACE
 * GameLayout composes the main area: centered board with a right sidebar.
 */
export default function GameLayout() {
  return (
    <main className="app-shell">
      <section className="main-area" aria-label="Main Content">
        <GameBoard />
      </section>
      <Sidebar />
    </main>
  );
}
