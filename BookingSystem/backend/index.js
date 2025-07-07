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
const profileRoutes = require('./routes/profileroutes');
const BACKEND = process.env.BACKEND;

// Run once on server startup
resetBlockedSlots();

// Run every hour (3600000 ms)
setInterval(() => {
  resetBlockedSlots();
}, 60 * 60 * 1000);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Routes
app.use("/api/labs", labRoutes);
app.use('/api/bookings', bookingRoutes); // existing
app.use('/api/auth', authRoutes);        // new for authentication
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Backend running...');
});

// DB & Server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, HOST, () => console.log(`🚀 Server running at http://${HOST}:${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));