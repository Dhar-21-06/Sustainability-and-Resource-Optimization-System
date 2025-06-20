// EnergyEfficiency/temperature/backend/influxService.js

const { Point } = require('@influxdata/influxdb-client');
const { getWriteApi } = require('../../../config/influxdb');

const bucket = process.env.INFLUX_BUCKET_TEMP;
const writeApi = getWriteApi(bucket, { module: 'temperature_module' });

function writeTemperatureData(temperature, fanSpeed) {
  const point = new Point('temp_fan_status')
    .floatField('temperature', temperature)
    .intField('fan_speed', fanSpeed);
    
  writeApi.writePoint(point);
}

module.exports = { writeTemperatureData };
