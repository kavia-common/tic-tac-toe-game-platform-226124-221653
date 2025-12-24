import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../api';

/**
 * PUBLIC_INTERFACE
 * Sidebar renders two sections:
 * - Game History: shows moves for the current active gameId (if any)
 * - Leaderboard: shows global leaderboard with manual refresh
 * It listens for "active-game-changed" window events to get the current gameId.
 * All API calls are resilient: 404/500 gracefully show placeholders without breaking preview.
 */
export default function Sidebar() {
  const [activeGameId, setActiveGameId] = useState(null);

  useEffect(() => {
    // Listen for active game changes from GameBoard
    const onActiveGame = (e) => {
      if (e && e.detail && e.detail.gameId) {
        setActiveGameId(e.detail.gameId);
      }
    };
    window.addEventListener('active-game-changed', onActiveGame);
    return () => window.removeEventListener('active-game-changed', onActiveGame);
  }, []);

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <HistoryPanel gameId={activeGameId} />
      <LeaderboardPanel />
    </aside>
  );
}

/**
 * HistoryPanel - fetches and shows history for a given gameId
 */
function HistoryPanel({ gameId }) {
  const [state, setState] = useState({ loading: false, error: null, items: [] });

  const fetchHistory = useCallback(async () => {
    if (!gameId) {
      setState({ loading: false, error: null, items: [] });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.getHistory(gameId);
      const normalized = normalizeHistory(data);
      setState({ loading: false, error: null, items: normalized });
    } catch (e) {
      // Graceful handling: treat 404/500 as empty state
      setState({ loading: false, error: e, items: [] });
    }
  }, [gameId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const title = useMemo(() => {
    return gameId ? 'Game History' : 'Game History (no active game)';
  }, [gameId]);

  return (
    <section className="sidebar-card" aria-label="Game History">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 className="sidebar-title" style={{ marginBottom: 0 }}>{title}</h3>
        <button
          type="button"
          className="btn"
          onClick={fetchHistory}
          aria-label="Refresh history"
          disabled={!gameId || state.loading}
          title={!gameId ? 'Start a game to load history' : 'Refresh history'}
        >
          {state.loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {!gameId ? (
        <div className="meta">Start a game to see its move history.</div>
      ) : state.loading ? (
        <div className="meta">Loading moves…</div>
      ) : state.error ? (
        <div className="meta" style={{ color: 'var(--color-error)' }}>
          {formatError(state.error) || 'Unable to load history. Try again.'}
        </div>
      ) : state.items.length === 0 ? (
        <>
          <div className="hr" />
          <div className="meta">No moves recorded yet for this game.</div>
        </>
      ) : (
        <>
          <div className="hr" />
          <ol className="move-list" aria-label="Game Move History">
            {state.items.map((m) => (
              <li key={`${m.moveNumber}-${m.position}`} className="move-item">
                <span className="move-dot" aria-hidden="true" />
                <span className="move-text">
                  #{m.moveNumber} - {m.player} to {formatPos(m.position)}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

/**
 * LeaderboardPanel - fetches and shows global leaderboard
 */
function LeaderboardPanel() {
  const [state, setState] = useState({ loading: false, error: null, rows: [] });

  const fetchLeaderboard = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.getLeaderboard();
      const normalized = normalizeLeaderboard(data);
      setState({ loading: false, error: null, rows: normalized });
    } catch (e) {
      setState({ loading: false, error: e, rows: [] });
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <section className="sidebar-card" aria-label="Leaderboard">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 className="sidebar-title" style={{ marginBottom: 0 }}>Leaderboard</h3>
        <button
          type="button"
          className="btn"
          onClick={fetchLeaderboard}
          aria-label="Refresh leaderboard"
          disabled={state.loading}
        >
          {state.loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {state.loading ? (
        <div className="meta">Loading leaderboard…</div>
      ) : state.error ? (
        <div className="meta" style={{ color: 'var(--color-error)' }}>
          {formatError(state.error) || 'Unable to load leaderboard. Try again.'}
        </div>
      ) : state.rows.length === 0 ? (
        <>
          <div className="hr" />
          <div className="meta">
            Global rankings will appear here once games are played. <span className="kicker">Coming soon</span>.
          </div>
        </>
      ) : (
        <>
          <div className="hr" />
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.rows.map((row) => (
              <li
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 10px',
                  border: '1px solid rgba(17,24,39,0.06)',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, #fff, #f9fafb)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                aria-label={`Leaderboard row for ${row.name}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--color-primary), #3b82f6)',
                      boxShadow: '0 6px 14px rgba(37,99,235,0.25)',
                    }}
                    aria-hidden="true"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 13 }}>{row.name}</strong>
                    <span className="meta" style={{ fontSize: 11 }}>
                      W {row.wins} · L {row.losses} · D {row.draws}
                    </span>
                  </div>
                </div>
                <div className="kicker" aria-label={`Score ${row.score}`}>{row.score}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// Helpers

function normalizeHistory(payload) {
  // Accepts either { moves: [...] } or a raw array
  if (!payload) return [];
  const moves = Array.isArray(payload) ? payload : Array.isArray(payload.moves) ? payload.moves : [];
  // Normalize shape to { moveNumber, player, position }
  return moves
    .map((m, idx) => ({
      moveNumber: m.moveNumber ?? m.number ?? idx + 1,
      player: m.player ?? m.symbol ?? m.side ?? '?',
      position: m.position ?? m.pos ?? m.cell ?? null,
    }))
    .filter((m) => m.position !== null && m.position !== undefined);
}

function normalizeLeaderboard(payload) {
  if (!payload) return [];
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
  return rows.map((r, idx) => ({
    id: r.id ?? r.playerId ?? `row-${idx}`,
    name: r.name ?? r.player ?? r.username ?? 'Unknown',
    wins: r.wins ?? r.win ?? r.w ?? 0,
    losses: r.losses ?? r.loss ?? r.l ?? 0,
    draws: r.draws ?? r.d ?? 0,
    score: r.score ?? r.points ?? r.elo ?? (r.wins ? r.wins * 3 + (r.draws ?? 0) : 0),
  }));
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

function formatError(e) {
  if (!e) return '';
  if (typeof e === 'string') return e;
  if (e.body && typeof e.body === 'object') {
    if (e.body.message) return e.body.message;
    try {
      return JSON.stringify(e.body);
    } catch {
      // ignore
    }
  }
  return e.message || 'An error occurred';
}

/* PUBLIC_INTERFACE
No exports; components are internal to Sidebar. */
