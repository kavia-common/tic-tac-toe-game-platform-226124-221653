import React from 'react';
import './App.css';
import './theme.css';
import Navbar from './components/Navbar';
import GameLayout from './components/GameLayout';

/**
 * PUBLIC_INTERFACE
 * App bootstraps the Ocean Professional themed shell:
 * - Top Navbar
 * - Centered 3x3 board placeholder
 * - Right sidebar for history and leaderboard
 * It contains no gameplay logic.
 */
function App() {
  return (
    <div className="App" role="application" aria-label="Tic Tac Toe - Ocean Professional">
      <Navbar />
      <GameLayout />
    </div>
  );
}

export default App;
