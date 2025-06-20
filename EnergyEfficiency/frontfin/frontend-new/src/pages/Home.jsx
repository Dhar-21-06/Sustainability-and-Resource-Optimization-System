import React from 'react';
import GrafanaPanel from '../components/Grafanapanel';
import './Home.css';

const Home = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Energy Efficiency Dashboard</h1>

      <div className="dashboard-grid">
        {/* Top Left */}
        <div className="dashboard-card motion">
          <h2>Motion Detection</h2>
          <GrafanaPanel src="http://localhost:3000/d-solo/1fdd3a93-59ed-4ff6-ab77-8da73f4495f4/motion-final?orgId=1&from=now-1h&to=now&timezone=browser&panelId=1&__feature.dashboardSceneSolo" />

          <div className="info-block">
            <h3 className="info-title">Motion Detection Summary</h3>
            <ul className="info-list">
              <li><strong>Motion Detected:</strong> 2025-06-19 10:58:22</li>
              <li><strong>Light Turned ON:</strong> 2025-06-19 10:59:23</li>
              <li><strong>Light ON Duration:</strong> 8 minutes 35 seconds</li>
            </ul>
          </div>
        </div>

        {/* Top Right */}
        <div className="dashboard-card ldr">
          <h2>Luminosity Sensor</h2>
          <GrafanaPanel src="http://localhost:3000/d-solo/7005b206-cb41-45ac-a6ef-10d7ff0cb7b6/ldr?orgId=1&from=now-1h&to=now&timezone=browser&panelId=1&__feature.dashboardSceneSolo" />

          <div className="info-block">
            <h3 className="info-title">Luminosity Detection Summary</h3>
            <ul className="info-list">
              <li><strong>Current Light Level:</strong> 320 lux</li>
              <li><strong>Status:</strong> Dim Light</li>
              <li><strong>Lights ON Time:</strong> 6 hours today</li>
            </ul>
          </div>
        </div>

        {/* Bottom Center */}
        <div className="dashboard-card temp">
          <h2>Temperature & Fan</h2>
          <GrafanaPanel src="http://localhost:3000/d-solo/529df352-719d-4c24-a63f-5d1d06d72638/temp?orgId=1&from=now-1h&to=now&timezone=browser&panelId=1&__feature.dashboardSceneSolo" />

          <div className="info-block">
            <h3 className="info-title">Temperature & Fan Speed Summary</h3>
            <ul className="info-list">
              <li><strong>Current Temp:</strong> 29.5°C</li>
              <li><strong>Fan Speed:</strong> 75%</li>
              <li><strong>Last Auto-Adjustment:</strong> 2025-06-19 11:30 AM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
