//
// Centralized API client for Tic Tac Toe Frontend
// - Reads base URL from REACT_APP_API_BASE_URL with a default fallback
// - Provides helper methods for common backend endpoints
// - Includes basic error handling and loading helpers
//

/**
 * Resolve the API base URL from environment variables, defaulting
 * to http://localhost:3001 if REACT_APP_API_BASE_URL is not set.
 */
const DEFAULT_API_BASE_URL = 'http://localhost:3001';

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the API base URL resolved from the environment. */
  const envUrl = process.env.REACT_APP_API_BASE_URL
    || process.env.REACT_APP_BACKEND_URL
    || process.env.REACT_APP_API_BASE
    || '';
  // Normalize trailing slash: do not end with '/'
  const finalBase = (envUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
  return finalBase;
}

/**
 * Helper to build full endpoint URLs safely.
 */
function buildUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Basic wrapper around fetch with JSON handling and error normalization.
 */
async function request(path, options = {}) {
  const url = buildUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let errBody = null;
      if (isJson) {
        try {
          errBody = await res.json();
        } catch {
          // ignore parse error
        }
      } else {
        try {
          errBody = await res.text();
        } catch {
          // ignore parse error
        }
      }
      const error = new Error(`Request failed: ${res.status} ${res.statusText}`);
      error.status = res.status;
      error.body = errBody;
      throw error;
    }

    // Return parsed JSON if available, else raw text or null
    if (isJson) {
      return await res.json();
    }
    try {
      return await res.text();
    } catch {
      return null;
    }
  } catch (error) {
    // Attach URL for easier debugging
    if (!error.requestUrl) error.requestUrl = url;
    throw error;
  }
}

/**
 * Loading state helpers for components to adopt a consistent pattern.
 */
// PUBLIC_INTERFACE
export function createLoadingState() {
  /** Create a standard loading state object. */
  return { loading: false, error: null };
}

// PUBLIC_INTERFACE
export function setLoading(stateObj) {
  /** Set loading=true and clear any existing error on a state object. */
  if (stateObj) {
    stateObj.loading = true;
    stateObj.error = null;
  }
  return stateObj;
}

// PUBLIC_INTERFACE
export function setSuccess(stateObj) {
  /** Set loading=false and clear error on success. */
  if (stateObj) {
    stateObj.loading = false;
    stateObj.error = null;
  }
  return stateObj;
}

// PUBLIC_INTERFACE
export function setError(stateObj, error) {
  /** Set loading=false and assign the error. */
  if (stateObj) {
    stateObj.loading = false;
    stateObj.error = error || new Error('Unknown error');
  }
  return stateObj;
}

/**
 * API METHODS
 * These methods map to expected backend REST endpoints.
 * Adjust endpoint paths if backend differs.
 */

// PUBLIC_INTERFACE
export async function createPlayer(name) {
  /** Create a player by name and return the created player object. */
  if (!name) throw new Error('Name is required');
  return request('/players', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

// PUBLIC_INTERFACE
export async function createGame(playerXId, playerOId) {
  /** Create a new game with X and O player IDs. */
  if (!playerXId || !playerOId) throw new Error('Both playerXId and playerOId are required');
  return request('/games', {
    method: 'POST',
    body: JSON.stringify({ playerXId, playerOId }),
  });
}

// PUBLIC_INTERFACE
export async function getGame(id) {
  /** Fetch current game state by ID. */
  if (!id) throw new Error('Game ID is required');
  return request(`/games/${encodeURIComponent(id)}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function postMove(gameId, position) {
  /** Post a move to a game by ID with the cell position (0-8). */
  if (!gameId) throw new Error('Game ID is required');
  if (position === undefined || position === null) throw new Error('Position is required');
  return request(`/games/${encodeURIComponent(gameId)}/moves`, {
    method: 'POST',
    body: JSON.stringify({ position }),
  });
}

// PUBLIC_INTERFACE
export async function getHistory(gameId) {
  /** Fetch the move history for a given game ID. */
  if (!gameId) throw new Error('Game ID is required');
  return request(`/games/${encodeURIComponent(gameId)}/history`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function getLeaderboard() {
  /** Fetch the global leaderboard. */
  return request('/leaderboard', { method: 'GET' });
}

// PUBLIC_INTERFACE
export const api = {
  /** Aggregated API helpers for convenient named import. */
  getApiBaseUrl,
  createPlayer,
  createGame,
  getGame,
  postMove,
  getHistory,
  getLeaderboard,
  createLoadingState,
  setLoading,
  setSuccess,
  setError,
};

export default api;
