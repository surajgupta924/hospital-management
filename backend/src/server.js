import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

let server;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection failed. API will start but database actions will fail.');
    console.error(error.message);
  }

  server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    console.log(`Allowed client origins: ${env.clientUrls.join(', ')} (+ *.vercel.app)`);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  if (server) server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) server.close(() => process.exit(0));
});
