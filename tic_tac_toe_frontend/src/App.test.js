import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders app shell without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});

test('clicking a board cell renders an X', async () => {
  render(<App />);
  // Wait a tick for initial game creation to settle
  // There is no async spinner, but we can attempt click a known cell.
  const firstCell = await screen.findByTestId('cell-0');
  expect(firstCell).toBeInTheDocument();
  expect(firstCell).toHaveTextContent('');
  fireEvent.click(firstCell);
  // After first move, X should appear
  expect(firstCell).toHaveTextContent('X');
});
