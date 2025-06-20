// EnergyEfficiency/temperature/backend/controllers/tempController.js

const { writeTemperatureData } = require('../influxService');

const pushTemperatureData = (req, res) => {
  const { temperature, fan_speed } = req.body;

  if (temperature === undefined || fan_speed === undefined) {
    return res.status(400).json({ error: 'Missing temperature or fan_speed value' });
  }

  writeTemperatureData(parseFloat(temperature), parseInt(fan_speed));
  return res.status(200).json({ message: 'Temperature and fan speed data pushed successfully' });
};

module.exports = { pushTemperatureData };
