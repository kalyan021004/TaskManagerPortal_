import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeSocket, getOnlineUsers } from './sockets/socket.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// HTTP server for socket.io
const server = createServer(app);

/* ===========================
   ✅ CORS CONFIG (ONLY HERE)
=========================== */
const allowedOrigins = [
  'https://task-manager-portal-zxpw.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server & Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Preflight
app.options('*', cors());

/* ===========================
   MIDDLEWARES
=========================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   SOCKET.IO
=========================== */
initializeSocket(server);

/* ===========================
   DATABASE
=========================== */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

/* ===========================
   ROUTES
=========================== */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

/* ===========================
   HEALTH CHECK
=========================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    onlineUsers: getOnlineUsers().length,
  });
});

/* ===========================
   PRODUCTION BUILD (OPTIONAL)
=========================== */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (_, res) =>
    res.sendFile(path.join(__dirname, 'client/dist/index.html'))
  );
}

/* ===========================
   ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

/* ===========================
   START SERVER
=========================== */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
