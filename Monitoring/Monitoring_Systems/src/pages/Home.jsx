// src/pages/Home.jsx

import React from 'react';
import GrafanaPanel from '../components/GrafanaPanel';
import './Home.css';

const Home = () => {
  const waterUrl =
    'http://localhost:3000/d-solo/1da2c09b-3174-49ec-bf12-ba4f1d21c4cd/water-monit?orgId=1&from=1750362933479&to=1750363233479&timezone=browser&panelId=1&__feature.dashboardSceneSolo';
  const electricityUrl =
    'http://localhost:3000/d-solo/eff6eed3-2420-4b96-99df-5627ca3bfc52/electric-monitoring?orgId=1&from=1748156949000&to=1748588949000&timezone=browser&panelId=1&__feature.dashboardSceneSolo';

  return (
    <div className="dashboard-grid">
      {/* Water Monitoring */}
      <div className="dashboard-card">
        <h2>Water Monitoring</h2>
        <GrafanaPanel src={waterUrl} />
        <div className="dashboard-summary">
          <h4>Summary</h4>
          <ul>
            <li><strong>Water Level:</strong> 65%</li>
            <li><strong>Tank Height:</strong> 100 cm</li>
            <li><strong>Status:</strong> Half Full</li>
          </ul>
        </div>
      </div>

      {/* Electricity Monitoring */}
      <div className="dashboard-card">
        <h2>Electricity Monitoring</h2>
        <GrafanaPanel src={electricityUrl} />
        <div className="dashboard-summary">
          <h4>Summary</h4>
          <ul>
            <li><strong>Current Usage:</strong> 2.3 kWh</li>
            <li><strong>Today's Consumption:</strong> 5.8 kWh</li>
            <li><strong>Status:</strong> Normal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
