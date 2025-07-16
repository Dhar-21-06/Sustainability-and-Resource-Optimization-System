import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GrafanaPanel from '../components/Grafanapanel';
import './Home.css';
import { FaBell } from 'react-icons/fa';

const Home = () => {
  const [waterData, setWaterData] = useState(null);
  const [electricityData, setElectricityData] = useState(null);
  const [error, setError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

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

        setWaterData(water);
        setElectricityData(elec);

        const newAlerts = [];
        const now = new Date().toLocaleString();

        if (water.alert) newAlerts.push({ msg: "🚰 Water usage exceeded 48,000 L today", time: now });
        if (elec.alert) newAlerts.push({ msg: "⚡ Electricity usage is above average today", time: now });

        const existing = JSON.parse(localStorage.getItem("notifications")) || [];
        const combined = [...existing, ...newAlerts];
        localStorage.setItem("notifications", JSON.stringify(combined));
        setNotifications(combined);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(true);
      }
    };

    const saved = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(saved);

    fetchData();
  }, []);

  const visibleAlerts = notifications.length === 0 ? [] : (showAll ? notifications : notifications.slice(-1));

  return (
    <div className="dashboard-body">
      <aside className="sidebar">
        <img src="/images/logo-cit.png" alt="CIT Logo" className="sidebar-logo" />
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="dashboard-title" onClick={() => window.location.reload()}>
            CIT Resource Monitoring
          </h1>

          <div className="notification-wrapper" style={{ position: 'relative' }}>
            <FaBell
              onClick={() => {
                setShowNotifications(prev => !prev);
                setShowAll(false);
              }}
              style={{ fontSize: '1.5rem', cursor: 'pointer', color: '#1e2a3a' }}
              title="View Notifications"
            />
            {notifications.length > 0 && !showNotifications && (
              <span
                className="notification-badge"
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  fontWeight: 'bold'
                }}
              >
                {notifications.length}
              </span>
            )}

            {showNotifications && (
              <div
                className="notification-dropdown"
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  marginTop: '0.5rem',
                  width: '280px',
                  zIndex: 999,
                  position: 'absolute',
                  right: 0
                }}
              >
                <strong style={{ fontSize: '1rem', color: '#1e2a3a' }}>Notifications</strong>

                {notifications.length === 0 ? (
                  <p style={{ marginTop: '0.75rem', color: '#666' }}>No recent notifications</p>
                ) : (
                  <>
                    <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem', listStyleType: 'disc' }}>
                      {visibleAlerts.map((note, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>
                          {note.msg}
                          <br />
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>{note.time}</span>
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        textAlign: 'center',
                        marginTop: '0.75rem',
                        fontSize: '0.85rem',
                        color: '#1565c0',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '500'
                      }}
                      onClick={() => navigate('/notifications')}
                    >
                      See all notifications →
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <header className="dashboard-header">
          <img src="/images/logo-citbif.png" alt="CITBIF Logo" className="institution-logo" />
        </header>

        {error && (
          <div className="error-message">
            ⚠️ Could not load data from backend. Please check connection.
          </div>
        )}

        <div className="cards">
          <div className="card">
            <h3>Water Monitoring</h3>
            <p><strong>Water Level:</strong> {waterData?.level || 'No recent data'}</p>
            <p><strong>Tank Height:</strong> {waterData?.height || 'No recent data'}</p>
            <p><strong>Status:</strong> {waterData?.status || 'No recent data'}</p>

            {waterData?.alert ? (
              <p className="alert-message">
                🚨 Alert: You have exceeded your assigned water usage limit for today.
              </p>
            ) : waterData && typeof waterData.waterLiters === 'number' ? (
              <p className="info-message">
                💧 You can still use <strong>{Math.max(0, 48000 - waterData.todayUsedLitres)} L</strong> before alert.
              </p>
            ) : null}
          </div>

          <div className="card">
            <h3>Electricity Monitoring</h3>
            <p><strong>Today's Consumption:</strong> {electricityData?.today || 'No recent data'}</p>
            <p><strong>Average Daily Usage:</strong> {electricityData?.avg || 'No recent data'}</p>
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
