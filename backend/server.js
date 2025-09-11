import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import spotifyRoutes from './routes/spotify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/spotify', spotifyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmoothMix API is running' });
});

app.listen(PORT, () => {
  console.log(`SmoothMix backend server running on port ${PORT}`);
});