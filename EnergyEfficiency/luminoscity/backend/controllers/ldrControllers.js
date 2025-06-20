const { getLatestLDRValue } = require('../services/influxService');

const getCurrentLDRStatus = async (req, res) => {
  try {
    const ldr = await getLatestLDRValue();
    res.json({ ldr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get LDR data' });
  }
};

module.exports = { getCurrentLDRStatus };
