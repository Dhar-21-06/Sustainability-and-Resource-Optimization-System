// src/components/GrafanaPanel.jsx
import React from 'react';

const GrafanaPanel = ({ src }) => {
  return (
    <div className="grafana-panel">
      <iframe
        src={src}
        width="100%"
        height="300"
        frameBorder="0"
        title="Grafana Panel"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default GrafanaPanel;
