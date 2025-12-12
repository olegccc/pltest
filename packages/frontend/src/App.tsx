import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

export const App = () => {
  return (
    <div data-testid="app">
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
