const { InfluxDB } = require('@influxdata/influxdb-client');
require('dotenv').config();

const influxDB = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

module.exports = { influxDB, org, bucket };
