// EnergyEfficiency/config/influxdb.js

const { InfluxDB } = require('@influxdata/influxdb-client');

const url = process.env.INFLUX_URL;
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;

const influxDB = new InfluxDB({ url, token });

function getWriteApi(bucket, defaultTags = {}) {
  const writeApi = influxDB.getWriteApi(org, bucket);
  if (defaultTags && Object.keys(defaultTags).length > 0) {
    writeApi.useDefaultTags(defaultTags);
  }
  return writeApi;
}

module.exports = { getWriteApi };
