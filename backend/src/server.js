import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { attachSocketAuth, registerLiveClassHandlers } from './sockets/liveClass.socket.js';

connectDB();

const PORT = config.server.port || 5001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.server.env === 'production' ? config.frontend?.url || true : true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

attachSocketAuth(io);
registerLiveClassHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
});
