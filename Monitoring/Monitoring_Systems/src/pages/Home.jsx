import React, { useEffect, useState } from 'react';
import GrafanaPanel from '../components/Grafanapanel';
import './Home.css';

const Home = () => {
  const [waterData, setWaterData] = useState(null);
  const [electricityData, setElectricityData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [waterRes, elecRes] = await Promise.all([
          fetch('http://localhost:5001/api/water-summary'),
          fetch('http://localhost:5001/api/electricity-summary'),
        ]);

        const [water, elec] = await Promise.all([
          waterRes.json(),
          elecRes.json(),
        ]);

        console.log("🚰 waterData:", water);
        console.log("⚡ electricityData:", elec);

        setWaterData(water);
        setElectricityData(elec);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(true);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-body">
      <aside className="sidebar">
  <button
    className="dashboard-refresh-btn"
    onClick={() => window.location.reload()}
    title="Click to refresh dashboard"
  >
    IoT Dashboard
  </button>
</aside>

      <main className="main-content">
        <h1 className="dashboard-title">Resource Monitoring</h1>
        <header className="dashboard-header">
  <div className="logo-section">
  <img src="/images/logo-cit.png" alt="CIT Logo" className="institution-logo" />
  <img src="/images/logo-citbif.png" alt="CITBIF Logo" className="institution-logo" />
  <img src="/images/logo-citil.png" alt="CITIL Logo" className="institution-logo" />
</div>

</header>

        {error && (
          <div className="error-message">
            ⚠️ Could not load data from backend. Please check connection.
          </div>
        )}

        <div className="cards">
          {/* 🔹 Water Card */}
          <div className="card">
            <h3>Water Monitoring</h3>
            <p><strong>Water Level:</strong> {waterData?.level || 'No recent data'}</p>
            <p><strong>Tank Height:</strong> {waterData?.height || 'No recent data'}</p>
            <p><strong>Status:</strong> {waterData?.status || 'No recent data'}</p>

            {waterData?.alert ? (
              <p className="alert-message">
                🚨 Alert: You have exceeded your assigned water usage limit for today. (48,000+ L used)
              </p>
            ) : waterData && typeof waterData.waterLiters === 'number' ? (
              <p className="info-message">
                💧 You can still use <strong>{Math.max(0, 48000 - waterData.todayUsedLitres)} L</strong> before alert.
              </p>
            ) : null}
          </div>

          {/* 🔸 Electricity Card */}
          <div className="card">
            <h3>Electricity Monitoring</h3>
            <p><strong>Today's Consumption:</strong> {electricityData?.today || 'No recent data'}</p>
            <p><strong>Average Daily Usage (Overall):</strong> {electricityData?.avg || 'No recent data'}</p>
            <p><strong>Total This Week:</strong> {electricityData?.weeklyTotal || 'No recent data'}</p>
            <p><strong>Status:</strong> {electricityData?.status || 'No recent data'}</p>

            {electricityData?.alert && (
              <p className="alert-message">
                ⚡ Alert: Today's electricity usage is above average!
              </p>
            )}
          </div>
        </div>

        <div className="grafana-row">
          <div className="grafana-block">
            <h4>Water Usage</h4>
            <GrafanaPanel src="http://localhost:3000/d-solo/1da2c09b-3174-49ec-bf12-ba4f1d21c4cd/water-monit?orgId=1&from=now-1d&to=now&panelId=1" />
          </div>

          <div className="grafana-block">
            <h4>Electricity Usage</h4>
            <GrafanaPanel src="http://localhost:3000/d-solo/eff6eed3-2420-4b96-99df-5627ca3bfc52/electric-monitoring?orgId=1&from=now-1d&to=now&panelId=1" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
