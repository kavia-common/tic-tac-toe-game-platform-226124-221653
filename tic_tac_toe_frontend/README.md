# Ocean Professional React Frontend (Tic Tac Toe)

Modern, lightweight React UI implementing Tic Tac Toe gameplay with history and a simple leaderboard. Styled with the Ocean Professional theme (blue/amber accents, subtle gradients, rounded corners, smooth shadows).

## Features

- 3x3 interactive board with turn indicator, win/draw detection, and disabled invalid moves
- New Game / Reset controls
- History panel (per active game)
- Leaderboard panel with refresh
- Graceful backend handling: if endpoints are unavailable, UI remains functional and shows friendly placeholders
- Minimal dependencies (CRA + vanilla CSS)

## Getting Started

In the project directory, run:

### `npm start`
Runs the app in development mode at http://localhost:3000.

### `npm test`
Runs lightweight smoke tests.

### `npm run build`
Builds the app for production in the `build` folder.

## API Client and Environment Configuration

For API calls, the frontend uses the first non-empty value of:
1. `REACT_APP_API_BASE`
2. `REACT_APP_BACKEND_URL`
3. `REACT_APP_API_BASE_URL` (backwards-compatible with template)
Otherwise, it defaults to `http://localhost:3001`.

Copy `.env.example` to `.env` and adjust as needed:
```
REACT_APP_API_BASE=http://localhost:3001
```

Import the API client anywhere in the app:
```js
import { api } from './src/api';
// api.createPlayer('Alice'), api.createGame(xId, oId), api.getGame(id), api.postMove(id, pos), api.getHistory(id), api.getLeaderboard()
```

## Theme

Theme variables and styles are in `src/theme.css` with:
- Primary: #2563EB
- Secondary/Success: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827
- Subtle gradients and shadows for depth

## Notes

If backend endpoints are unavailable, gameplay still works locally with mock fallbacks. History and leaderboard panels show placeholders and errors are displayed non-intrusively.
