const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pirRoutes = require('./routes/pirRoutes');

const app = express();
app.use(cors());
app.use('/api/pir', pirRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 PIR Backend running on port ${PORT}`);
});
