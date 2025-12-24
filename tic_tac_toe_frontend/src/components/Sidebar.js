import React from 'react';
// Wire the API client to be available for future use without altering UI yet
// eslint-disable-next-line no-unused-vars
import { api } from '../api';

/**
 * PUBLIC_INTERFACE
 * Sidebar is a placeholder for upcoming game history and leaderboard.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <section className="sidebar-card" aria-label="Game History">
        <h3 className="sidebar-title">Game History</h3>
        <div className="meta">Recent matches will appear here.</div>
        <div className="hr" />
        <div className="meta">No games yet — start your first match with “New Game”.</div>
      </section>
      <section className="sidebar-card" aria-label="Leaderboard">
        <h3 className="sidebar-title">Leaderboard</h3>
        <div className="meta">
          Global rankings and stats will be shown here.
          {' '}
          <span className="kicker">Coming soon</span>.
        </div>
      </section>
    </aside>
  );
}
