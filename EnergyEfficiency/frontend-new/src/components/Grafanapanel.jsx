import React from 'react';

const GrafanaPanel = ({ src }) => {
  return (
    <iframe
      src={src}
      width="100%"
      height="300"
      frameBorder="0"
      title="Grafana Panel"
    ></iframe>
  );
};

export default GrafanaPanel;
