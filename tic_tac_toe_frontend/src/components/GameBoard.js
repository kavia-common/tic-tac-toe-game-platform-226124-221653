import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import Square from './Square';
import MoveList from './MoveList';

/**
 * PUBLIC_INTERFACE
 * GameBoard is the interactive 3x3 gameplay component.
 * - Creates players and starts a new game via API client (with graceful mock fallback)
 * - Allows making moves, updating local state for board, current player, and status
 * - Disables invalid moves
 * - Shows turn indicator and win/draw banner
 * - Provides Reset/New Game action
 */
export default function GameBoard() {
  // Core game state
  const [board, setBoard] = useState(Array(9).fill(null)); // ['X','O',...]
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [status, setStatus] = useState({ state: 'idle', winner: null }); // idle|in-progress|won|draw
  const [gameId, setGameId] = useState(null);
  const [players, setPlayers] = useState({ X: null, O: null });

  // Moves for MoveList
  const [moves, setMoves] = useState([]);

  // Loading + error - local, simple flags
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);

  // Helpers to evaluate game state locally in case backend isn't ready or to optimistically update
  const winningLines = useMemo(
    () => [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
    []
  );

  const checkWinner = useCallback(
    (b) => {
      for (const [a, c, d] of winningLines) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) {
          return b[a];
        }
      }
      if (b.every((v) => v === 'X' || v === 'O')) return 'draw';
      return null;
    },
    [winningLines]
  );

  // PUBLIC_INTERFACE
  async function safeCreatePlayer(name) {
    /** Attempt to create player using API and fallback to mock if failed. */
    try {
      const p = await api.createPlayer(name);
      return p;
    } catch (e) {
      // Mock fallback
      return { id: `mock-${name}-${Math.random().toString(36).slice(2, 8)}`, name };
    }
  }

  // PUBLIC_INTERFACE
  async function safeCreateGame(xId, oId) {
    /** Attempt to create game using API and fallback to mock if failed. */
    try {
      const g = await api.createGame(xId, oId);
      return g;
    } catch (e) {
      return {
        id: `mock-game-${Math.random().toString(36).slice(2, 8)}`,
        board: Array(9).fill(null),
        currentPlayer: 'X',
        status: 'in-progress',
      };
    }
  }

  // PUBLIC_INTERFACE
  async function safePostMove(gId, position) {
    /** Attempt to post a move and return updated game state; fallback to local compute. */
    try {
      const updated = await api.postMove(gId, position);
      return updated;
    } catch (e) {
      // compute locally
      const nextBoard = [...board];
      if (nextBoard[position]) {
        return {
          id: gId,
          board: nextBoard,
          currentPlayer,
          status: status.state,
        };
      }
      nextBoard[position] = currentPlayer;
      const outcome = checkWinner(nextBoard);
      let newStatus = 'in-progress';
      let winner = null;
      if (outcome === 'draw') newStatus = 'draw';
      else if (outcome === 'X' || outcome === 'O') {
        newStatus = 'won';
        winner = outcome;
      }
      return {
        id: gId,
        board: nextBoard,
        currentPlayer: winner || newStatus === 'draw' ? currentPlayer : currentPlayer === 'X' ? 'O' : 'X',
        status: newStatus,
        winner,
      };
    }
  }

  // Start a new game on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsBusy(true);
      setError(null);
      try {
        const px = await safeCreatePlayer('Player X');
        const po = await safeCreatePlayer('Player O');
        if (!mounted) return;
        setPlayers({ X: px, O: po });

        const g = await safeCreateGame(px.id, po.id);
        if (!mounted) return;

        setGameId(g.id);
        setBoard(g.board || Array(9).fill(null));
        setCurrentPlayer(g.currentPlayer || 'X');
        setStatus({ state: g.status || 'in-progress', winner: g.winner || null });
        setMoves([]);
        // Notify sidebar about the active game change
        try {
          const evt = new CustomEvent('active-game-changed', { detail: { gameId: g.id } });
          window.dispatchEvent(evt);
        } catch {
          // ignore if CustomEvent is not available
        }
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setIsBusy(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSquareClick = async (index) => {
    if (isBusy) return;
    if (status.state === 'won' || status.state === 'draw') return;
    if (board[index]) return;

    setIsBusy(true);
    setError(null);
    try {
      const updated = await safePostMove(gameId, index);

      // If backend returns canonical shape, prefer it; otherwise rely on fallback shape
      const nextBoard = updated.board || board;
      const nextStatus = updated.status || 'in-progress';
      const nextWinner = updated.winner || null;

      // If backend didn't send next player, compute it locally
      let nextPlayer = updated.currentPlayer;
      if (!nextPlayer) {
        if (nextStatus === 'in-progress') {
          nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
        } else {
          nextPlayer = currentPlayer;
        }
      }

      setBoard(nextBoard);
      setCurrentPlayer(nextPlayer);
      setStatus({ state: nextStatus, winner: nextWinner });

      // Update local move list
      setMoves((prev) => [
        ...prev,
        { moveNumber: prev.length + 1, player: currentPlayer, position: index },
      ]);
    } catch (e) {
      setError(e);
    } finally {
      setIsBusy(false);
    }
  };

  const resetGame = async () => {
    if (isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      // Recreate players and game to keep flow consistent; backend may record new game
      const px = players.X?.id ? players.X : await safeCreatePlayer('Player X');
      const po = players.O?.id ? players.O : await safeCreatePlayer('Player O');

      const g = await safeCreateGame(px.id, po.id);

      setGameId(g.id);
      setBoard(g.board || Array(9).fill(null));
      setCurrentPlayer(g.currentPlayer || 'X');
      setStatus({ state: g.status || 'in-progress', winner: g.winner || null });
      setMoves([]);
      try {
        const evt = new CustomEvent('active-game-changed', { detail: { gameId: g.id } });
        window.dispatchEvent(evt);
      } catch {
        // ignore
      }
    } catch (e) {
      // As a last resort, local reset
      setBoard(Array(9).fill(null));
      setCurrentPlayer('X');
      setStatus({ state: 'in-progress', winner: null });
      setMoves([]);
      setError(e);
    } finally {
      setIsBusy(false);
    }
  };

  const turnText =
    status.state === 'won'
      ? `Winner: ${status.winner}`
      : status.state === 'draw'
      ? 'Draw game'
      : `Turn: ${currentPlayer}`;

  const cells = Array.from({ length: 9 }, (_, i) => i);
  const boardDisabled = isBusy || status.state === 'won' || status.state === 'draw';

  return (
    <div className="surface-card board-wrapper" aria-label="Tic Tac Toe board area">
      <div className="board-header" style={{ width: '100%', maxWidth: '520px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          className={`kicker ${status.state === 'won' ? 'winner' : status.state === 'draw' ? 'draw' : ''}`}
          role="status"
          aria-live="polite"
        >
          {turnText}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn"
            onClick={resetGame}
            aria-label="Reset game"
            disabled={isBusy}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={resetGame}
            aria-label="Start new game"
            disabled={isBusy}
          >
            New Game
          </button>
        </div>
      </div>

      <div className="board" role="grid" aria-label="3 by 3 board">
        {cells.map((idx) => (
          <Square
            key={idx}
            index={idx}
            value={board[idx]}
            onClick={() => handleSquareClick(idx)}
            disabled={boardDisabled || Boolean(board[idx])}
          />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '520px', marginTop: 14 }}>
        {error ? (
          <div className="meta" style={{ color: 'var(--color-error)' }}>
            {formatError(error)}
          </div>
        ) : null}
      </div>

      <div style={{ width: '100%', maxWidth: '520px', marginTop: 14 }}>
        <h4 className="sidebar-title" style={{ marginBottom: 8 }}>Moves</h4>
        <MoveList moves={moves} />
      </div>
    </div>
  );
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
