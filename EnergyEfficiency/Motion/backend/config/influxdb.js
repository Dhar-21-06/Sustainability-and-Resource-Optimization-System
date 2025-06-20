const { InfluxDB } = require('@influxdata/influxdb-client');
require('dotenv').config({ path: './motion/.env' }); // path correction if needed

const influx = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

const writeApi = influx.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET, 's');
writeApi.useDefaultTags({ app: 'motion_monitor' });

module.exports = writeApi;
