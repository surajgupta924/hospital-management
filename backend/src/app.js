import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import routes from './routes/index.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.clientUrls.includes(origin)) {
      callback(null, origin || env.clientUrls[0]);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HMS API Server',
    apiBase: '/api/v1',
    health: '/api/v1/health',
    login: '/api/v1/auth/login',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Use /api/v1 as the API base path',
    health: '/api/v1/health',
  });
});

app.use('/api/v1', routes);

// Fallback for clients calling /auth/* without /api/v1 prefix
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.redirect('/api/v1/health');
});

app.use(notFound);
app.use(errorHandler);

export default app;
