import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import EnergyEfficiencyHome from '../pages/EnergyEfficiencyHome';
import MotionDashboard from '../pages/MotionDashboard';
import LdrDashboard from '../pages/LdrDashboard';
import TempFanDashboard from '../pages/TempFanDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/energy-efficiency" element={<EnergyEfficiencyHome />} />
        <Route path="/motion" element={<MotionDashboard />} />
        <Route path="/luminosity" element={<LdrDashboard />} />
        <Route path="/temperature" element={<TempFanDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
