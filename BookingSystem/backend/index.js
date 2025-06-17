const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const bookingRoutes = require('./routes/bookingroutes');
const authRoutes = require('./routes/authroutes');
const notificationRoutes = require('./routes/notificationroutes');
const resetBlockedSlots = require('./controllers/resetBlockedSlots');
const labRoutes = require("./routes/labroutes");

// Run once on server startup
resetBlockedSlots();

// Run every hour (3600000 ms)
setInterval(() => {
  resetBlockedSlots();
}, 60 * 60 * 1000);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use("/api/labs", labRoutes);
app.use('/api/bookings', bookingRoutes); // existing
app.use('/api/auth', authRoutes);        // new for authentication
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Backend running...');
});

// DB & Server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));