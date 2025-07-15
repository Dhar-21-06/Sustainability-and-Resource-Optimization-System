require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { InfluxDB } = require('@influxdata/influxdb-client');

const app = express();
const PORT = 5002;

app.use(cors());

// InfluxDB clients per module
const influxMotion = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN_MOTION });
const influxLDR    = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN_LDR });
const influxTemp   = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN_TEMP });

const queryMotion = influxMotion.getQueryApi(process.env.INFLUX_ORG_MOTION);
const queryLDR    = influxLDR.getQueryApi(process.env.INFLUX_ORG_LDR);
const queryTemp   = influxTemp.getQueryApi(process.env.INFLUX_ORG_TEMP);

// Reusable query handler
function handleQuery(queryApi, fluxQuery, res, formatter) {
  let result = null;
  queryApi.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
      const o = tableMeta.toObject(row);
      result = formatter(o);
    },
    complete: () => res.json(result || { message: 'No data available' }),
    error: (error) => {
      console.error('Query Error:', error);
      res.status(500).json({ error: 'InfluxDB query failed' });
    }
  });
}

// 🔹 Motion Summary
// 🔹 Motion Summary
app.get('/api/motion-summary', async (req, res) => {
  const flux = `
    from(bucket: "${process.env.INFLUX_BUCKET_MOTION}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "motion_status" and r._field == "status" and r._value == 1)
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 1)
  `;

  const rows = [];

  await new Promise((resolve, reject) => {
    queryMotion.queryRows(flux, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        rows.push(o);
      },
      complete: resolve,
      error: (err) => {
        console.error('Motion query error:', err);
        res.status(500).json({ error: 'Motion query failed' });
        reject(err);
      },
    });
  });

  if (rows.length === 0) {
    return res.json({
      lastDetected: 'No motion detected in last 1 hr',
      time: '0 min'
    });
  }

  const latestDetection = new Date(rows[0]._time).toLocaleString();

  res.json({
    lastDetected: latestDetection,
    time: 'Active (light ON)' // optional: static text if real duration isn't calculated
  });
});



// 🔹 LDR Summary
app.get('/api/ldr-summary', async (req, res) => {
  const flux = `
    from(bucket: "${process.env.INFLUX_BUCKET_LDR}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "light_sensor" and r._field == "lux")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 1)
  `;

  const rows = [];

  await new Promise((resolve, reject) => {
    queryLDR.queryRows(flux, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        rows.push(o);
      },
      complete: resolve,
      error: (err) => {
        console.error('LDR query error:', err);
        res.status(500).json({ error: 'LDR query failed' });
        reject(err);
      },
    });
  });

  if (rows.length === 0) {
    return res.json({ lux: 'N/A', status: 'No data in last 1 hour' });
  }

  const latest = rows[0];
  const luxValue = Number(latest._value);
  const status = luxValue > 300 ? 'Light ON' : 'Light OFF';

  res.json({
    lux: luxValue.toFixed(0),
    status
  });
});

// 🔹 Temperature Summary
app.get('/api/temp-summary', async (req, res) => {
  const flux = `
    from(bucket: "${process.env.INFLUX_BUCKET_TEMP}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "temperature" and r._field == "temp")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 1)
  `;

  const rows = [];

  await new Promise((resolve, reject) => {
    queryTemp.queryRows(flux, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        rows.push(o);
      },
      complete: resolve,
      error: (err) => {
        console.error('Temperature query error:', err);
        res.status(500).json({ error: 'Temperature query failed' });
        reject(err);
      },
    });
  });

  if (rows.length === 0) {
    return res.json({ temp: 'No data in last 1 hour', fanSpeed: 'N/A',  });
  }

  const latest = rows[0];
  const tempValue = Number(latest._value);
  let fanSpeed;

  if (tempValue > 30) fanSpeed = '100%';
  else if (tempValue > 27) fanSpeed = '75%';
  else fanSpeed = '50%';

  res.json({
    temp: tempValue.toFixed(1),
    fanSpeed,
    time: new Date(latest._time).toLocaleString()
  });
});


app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
