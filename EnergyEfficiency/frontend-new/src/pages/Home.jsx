import React, { useEffect, useState } from 'react';
import GrafanaPanel from '../components/Grafanapanel';
import './Home.css';

const Home = () => {
  const [motion, setMotion] = useState({ time: 'N/A', lastDetected: 'N/A' });
  const [ldr, setLdr] = useState({ lux: 'N/A', status: 'N/A' });
  const [temp, setTemp] = useState({ temp: 'N/A', fanSpeed: 'N/A', time: 'N/A' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, l, t] = await Promise.all([
          fetch('http://localhost:5000/api/motion-summary').then(res => res.json()),
          fetch('http://localhost:5000/api/ldr-summary').then(res => res.json()),
          fetch('http://localhost:5000/api/temp-summary').then(res => res.json())
        ]);
        setMotion(m);
        setLdr(l);
        setTemp(t);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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



        <h1 className="dashboard-title">Energy Overview</h1>

        {/* Header Bar with Logos */}
<header className="dashboard-header">
  <div className="logo-group">
    <img src="/images/cit-main-logo.png" alt="CIT" className="logo" />
    <img src="/images/citbif-logo.png" alt="CITBIF Logo" className="logo citbif-logo" />
    <img src="/images/citil-logo.png" alt="CITIL" className="logo" />
  </div>
</header>


        <div className="cards">
          <div className="card">
            <h3>Motion</h3>
            <p><strong>Last Detected:</strong> {motion.lastDetected}</p>
            <p><strong>Duration of Light On:</strong> {motion.time}</p>
          </div>

          <div className="card">
            <h3>Light</h3>
            <p><strong>Current Lux:</strong> {ldr.lux}</p>
            <p><strong>Status:</strong> {ldr.status}</p>
          </div>

          <div className="card">
            <h3>Temperature</h3>
            <p><strong>Temp of Room:</strong> {temp.temp} °C</p>
            <p><strong>Fan Speed:</strong> {temp.fanSpeed}</p>
          </div>
        </div>

        <div className="grafana-row">
          <div className="grafana-block">
            <h4>Motion Detection</h4>
            <GrafanaPanel src="http://localhost:3000/d-solo/1fdd3a93-59ed-4ff6-ab77-8da73f4495f4/motion-final?orgId=1&from=now-1h&to=now&panelId=1" />
          </div>

          <div className="grafana-block">
            <h4>Luminosity</h4>
            <GrafanaPanel src="http://localhost:3000/d-solo/7005b206-cb41-45ac-a6ef-10d7ff0cb7b6/ldr?orgId=1&from=now-1h&to=now&panelId=1" />
          </div>

          <div className="grafana-block">
            <h4>Temperature & Fan</h4>
            <GrafanaPanel src="http://localhost:3000/d-solo/529df352-719d-4c24-a63f-5d1d06d72638/temp?orgId=1&from=now-1h&to=now&panelId=1" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
