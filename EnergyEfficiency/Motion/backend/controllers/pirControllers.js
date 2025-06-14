const { fetchMotionData } = require('../services/influxService');

const getMotionStatus = async (req, res) => {
  try {
    const data = await fetchMotionData();

    if (!data.length) {
      return res.status(404).json({ message: 'No motion data found' });
    }

    const latest = data[data.length - 1];
    res.json({
      status: latest._value === 1 ? 'Motion Detected' : 'No Motion',
      timestamp: latest._time,
      raw: latest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch motion status' });
  }
};

module.exports = { getMotionStatus };
