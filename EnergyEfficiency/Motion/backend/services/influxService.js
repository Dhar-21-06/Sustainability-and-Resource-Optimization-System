const writeApi = require('../config/influxdb');
const { Point } = require('@influxdata/influxdb-client');

const writeMotionStatus = (motionDetected) => {
  const point = new Point('motion_status')
    .booleanField('status', motionDetected)
    .timestamp(new Date());

  writeApi.writePoint(point);
};

module.exports = { writeMotionStatus };
