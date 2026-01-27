import { BrowserRouter } from 'react-router-dom';
import AppRouter from './Router';

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}
