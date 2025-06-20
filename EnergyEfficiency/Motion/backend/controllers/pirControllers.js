const { writeMotionStatus } = require('../services/influxServices');

const handleMotion = async (req, res) => {
  try {
    const { status } = req.body; // expects true or false
    if (typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Status must be a boolean' });
    }
    writeMotionStatus(status);
    res.status(200).json({ message: 'Motion status recorded' });
  } catch (err) {
    console.error('Error writing motion status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { handleMotion };
