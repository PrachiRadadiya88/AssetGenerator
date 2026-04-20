/**
 * App.jsx — Root application component with routing.
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import DescriptionGeneratorPage from './pages/DescriptionGeneratorPage';
import RebrandPage from './pages/RebrandPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generator" element={<InputPage />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/description-generator" element={<DescriptionGeneratorPage />} />
          <Route path="/rebrand" element={<RebrandPage />} />
        </Routes>
      </div>
    </Router>
  );
}
