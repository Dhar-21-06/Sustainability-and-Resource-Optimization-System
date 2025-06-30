require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { InfluxDB } = require('@influxdata/influxdb-client');

const app = express();
const PORT = 5001;

app.use(cors());

const influxWater = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN_WATER });
const influxElec  = new InfluxDB({ url: process.env.INFLUX_URL, token: process.env.INFLUX_TOKEN_ELECTRICITY });

const queryWater = influxWater.getQueryApi(process.env.INFLUX_ORG_WATER);
const queryElec  = influxElec.getQueryApi(process.env.INFLUX_ORG_ELECTRICITY);

// 🔹 Water Summary
app.get('/api/water-summary', async (req, res) => {
  console.log("📥 GET /api/water-summary called");

  const tankCapacity = 24000;
  const height = '5 Metre';
  let refillCount = 0;
  let lastWasLow = false;

  const levels = [];

  const flux = `
    from(bucket: "${process.env.INFLUX_BUCKET_WATER}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "water_level" and r._field == "level")
      |> sort(columns: ["_time"])
  `;

  await new Promise((resolve, reject) => {
    queryWater.queryRows(flux, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        levels.push({ time: o._time, value: Number(o._value) });
      },
      complete: resolve,
      error: (err) => {
        console.error('❌ Water query error:', err);
        res.status(500).json({ error: 'Water query failed' });
        reject(err);
      }
    });
  });

  let currentLevel = 0;
  let status = 'No recent data';

  if (levels.length > 0) {
    // Detect refills
    levels.forEach((entry) => {
      const level = entry.value;
      if (level < 30) lastWasLow = true;
      else if (level >= 95 && lastWasLow) {
        refillCount += 1;
        lastWasLow = false;
      }
    });

    const latest = levels[levels.length - 1];
    currentLevel = latest.value;
    status = currentLevel > 80 ? "Full" : currentLevel > 40 ? "Half Full" : "Low";
  }

  const alertRefills = refillCount >= 2;
  const waterLiters = Math.round((currentLevel / 100) * tankCapacity);
  const litresUsedTotal = refillCount * tankCapacity;

  // ➕ Calculate today's usage
  const fluxToday = `
    from(bucket: "${process.env.INFLUX_BUCKET_WATER}")
      |> range(start: -1d)
      |> filter(fn: (r) => r._measurement == "water_level" and r._field == "level")
      |> sort(columns: ["_time"])
  `;

  const todayLevels = [];

  await new Promise((resolve, reject) => {
    queryWater.queryRows(fluxToday, {
      next: (row, tableMeta) => {
        const o = tableMeta.toObject(row);
        todayLevels.push(Number(o._value));
      },
      complete: resolve,
      error: reject
    });
  });

  let todayUsedLitres = 0;
  let usageAlert = false;

  if (todayLevels.length >= 2) {
    const start = todayLevels[0];
    const end = todayLevels[todayLevels.length - 1];
    const diffPercent = Math.max(0, start - end);
    todayUsedLitres = Math.round((diffPercent / 100) * tankCapacity);
    usageAlert = todayUsedLitres > 48000;
  }

  res.json({
    level: `${currentLevel.toFixed(1)}%`,
    height,
    status,
    waterLiters,
    litresUsed: litresUsedTotal,
    alert: alertRefills || usageAlert,
    refills: refillCount,
    todayUsedLitres,
    usageAlert
  });
});

// 🔹 Electricity Summary
app.get('/api/electricity-summary', async (req, res) => {
  let today = null, avg = null, weeklyTotal = null;

  const fluxToday = `
    from(bucket: "${process.env.INFLUX_BUCKET_ELECTRICITY}")
      |> range(start: -1d)
      |> filter(fn: (r) => r._measurement == "energy_usage" and r._field == "usage_kwh")
      |> last()
  `;

  const fluxAvg = `
    from(bucket: "${process.env.INFLUX_BUCKET_ELECTRICITY}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "energy_usage" and r._field == "usage_kwh")
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
      |> mean()
  `;

  const fluxWeekTotal = `
    from(bucket: "${process.env.INFLUX_BUCKET_ELECTRICITY}")
      |> range(start: -7d)
      |> filter(fn: (r) => r._measurement == "energy_usage" and r._field == "usage_kwh")
      |> aggregateWindow(every: 1d, fn: sum, createEmpty: false)
      |> sum()
  `;

  try {
    await new Promise((resolve, reject) => {
      queryElec.queryRows(fluxToday, {
        next: (row, tableMeta) => { today = tableMeta.toObject(row)._value },
        complete: resolve,
        error: reject
      });
    });

    await new Promise((resolve, reject) => {
      queryElec.queryRows(fluxAvg, {
        next: (row, tableMeta) => { avg = tableMeta.toObject(row)._value },
        complete: resolve,
        error: reject
      });
    });

    await new Promise((resolve, reject) => {
      queryElec.queryRows(fluxWeekTotal, {
        next: (row, tableMeta) => { weeklyTotal = tableMeta.toObject(row)._value },
        complete: resolve,
        error: reject
      });
    });

    if (today === null || avg === null || weeklyTotal === null) {
      return res.json({
        today: 'N/A',
        avg: 'N/A',
        weeklyTotal: 'N/A',
        status: 'No data available',
        alert: false
      });
    }

    const status = today > avg ? 'Above Normal' : 'Normal';
    const alert = today > avg;

    res.json({
      today: `${today.toFixed(1)} kWh`,
      avg: `${avg.toFixed(1)} kWh`,
      weeklyTotal: `${weeklyTotal.toFixed(1)} kWh`,
      status,
      alert
    });

  } catch (err) {
    console.error("❌ Electricity summary error:", err);
    res.status(500).json({ error: 'Electricity summary failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
