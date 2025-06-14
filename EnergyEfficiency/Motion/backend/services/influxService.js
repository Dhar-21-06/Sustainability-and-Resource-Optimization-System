const { queryApi } = require('../config/influxdb');

async function fetchMotionData() {
  const fluxQuery = `
    from(bucket: "${process.env.INFLUX_BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "motion_status" and r._field == "status")
      |> yield(name: "motion")
  `;

  const results = [];

  await queryApi.collectRows(fluxQuery, {
    next(row, tableMeta) {
      results.push(tableMeta.toObject(row));
    },
    error(error) {
      console.error('Error querying InfluxDB:', error);
    },
    complete() {},
  });

  return results;
}

module.exports = { fetchMotionData };
