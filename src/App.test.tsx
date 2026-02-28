import { render, screen } from '@testing-library/react';
import App from './App';

test('renders faceout builder header', () => {
  render(<App />);
  const heading = screen.getByText(/Faceout Builder/i);
  expect(heading).toBeInTheDocument();
});
