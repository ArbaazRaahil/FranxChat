/**
 * Spotlight Full-Stack Express Server with WebSocket Real-Time Engine
 * - Port 3000
 * - Real-Time WebSockets for instant direct messages, presence heartbeats, and optimistic likes
 * - Express + Vite middleware in development
 */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // WebSocket Server for Real-Time Multi-User Synchronization
  const wss = new WebSocketServer({ server, path: '/ws' });
  const activeSockets = new Set<WebSocket>();
  const userPresence = new Map<string, { status: string; lastSeen: number }>();

  wss.on('connection', (ws) => {
    activeSockets.add(ws);

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        // Process presence tracking
        if (data.type === 'presence:heartbeat' && data.payload?.userId) {
          userPresence.set(data.payload.userId, {
            status: data.payload.status || 'online',
            lastSeen: Date.now(),
          });
        }

        // Broadcast to all other connected clients (Server Authoritative Fan-Out)
        const broadcastStr = JSON.stringify(data);
        for (const client of activeSockets) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(broadcastStr);
          }
        }
      } catch (err) {
        console.error('Failed to parse incoming WebSocket message', err);
      }
    });

    ws.on('close', () => {
      activeSockets.delete(ws);
    });

    ws.on('error', () => {
      activeSockets.delete(ws);
    });
  });

  // Health and API routes
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Spotlight Core Server',
      activeConnections: activeSockets.size,
      onlineUsers: userPresence.size,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[Spotlight] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Spotlight] Failed to start server:', err);
  process.exit(1);
});
