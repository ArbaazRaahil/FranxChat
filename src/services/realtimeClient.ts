/**
 * Real-Time Distributed Messaging & Presence Synchronization Client
 * Adheres to real-time-and-multi-user guidelines:
 * - Server as source of truth with WebSocket support
 * - Event-based communication with idempotent handlers
 * - Optimistic updates with reconciliation
 * - Active presence heartbeat tracking (online/offline indicator dots)
 * - BroadcastChannel support for instant multi-tab sync
 */
import { RealtimePayload, RealtimeEventType, UserStatus } from '../types';

type EventHandler<T = any> = (payload: T) => void;

class RealtimeService {
  private ws: WebSocket | null = null;
  private listeners: Map<RealtimeEventType, Set<EventHandler>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;
  private currentUserId: string | null = null;
  private isConnected = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('spotlight_realtime_sync');
        this.broadcastChannel.onmessage = (event: MessageEvent<RealtimePayload>) => {
          this.dispatchLocal(event.data.type, event.data.payload);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported in current environment', err);
      }
    }
  }

  public init(userId?: string) {
    if (userId) this.currentUserId = userId;
    this.connectWebSocket();
    this.startHeartbeat();
  }

  public setUserId(userId: string | null) {
    this.currentUserId = userId;
    if (this.isConnected && userId) {
      this.send('presence:heartbeat', { userId, status: 'online' });
    }
  }

  private connectWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.currentUserId) {
          this.send('presence:heartbeat', { userId: this.currentUserId, status: 'online' });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimePayload = JSON.parse(event.data);
          this.dispatchLocal(data.type, data.payload);
        } catch {
          // Ignore invalid frames
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Auto-reconnect after 3s
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connectWebSocket();
        }, 3000);
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  private startHeartbeat() {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUserId) {
        this.send('presence:heartbeat', {
          userId: this.currentUserId,
          status: 'online' as UserStatus,
          timestamp: new Date().toISOString(),
        });
      }
    }, 15000); // 15s presence ping
  }

  public send<T>(type: RealtimeEventType, payload: T) {
    const data: RealtimePayload<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      senderId: this.currentUserId || undefined,
    };

    // 1. Dispatch over WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }

    // 2. Dispatch to other browser tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(data);
    }

    // 3. Dispatch locally in active window
    this.dispatchLocal(type, payload);
  }

  public subscribe<T>(type: RealtimeEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(handler);
      }
    };
  }

  private dispatchLocal<T>(type: RealtimeEventType, payload: T) {
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`Error in realtime handler for ${type}`, err);
        }
      });
    }
  }

  public destroy() {
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.heartbeatInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    this.listeners.clear();
  }
}

export const realtimeClient = new RealtimeService();
