const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const pirRoutes = require('../motion/routes/Pirroutes'); // adjust path as needed

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', pirRoutes); // motion endpoint => /api/motion

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
