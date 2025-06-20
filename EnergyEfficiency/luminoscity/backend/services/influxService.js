const { influxDB, org, bucket } = require('../config/influxdb');
const { QueryApi } = require('@influxdata/influxdb-client');

const queryApi = influxDB.getQueryApi(org);

// Get latest LDR reading
async function getLatestLDRValue() {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -10m)
      |> filter(fn: (r) => r._measurement == "luminosity" and r._field == "ldr")
      |> last()
  `;

  let ldrValue = null;

  try {
    const rows = [];
    await queryApi.collectRows(fluxQuery, {
      next: (row) => rows.push(row),
      error: (err) => { throw err },
      complete: () => {},
    });

    if (rows.length > 0) {
      ldrValue = rows[0]._value;
    }
  } catch (err) {
    console.error('Error querying LDR value:', err);
  }

  return ldrValue;
}

module.exports = { getLatestLDRValue };
