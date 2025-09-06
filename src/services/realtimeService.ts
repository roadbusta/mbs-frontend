/**
 * Real-time Updates Service
 * 
 * WebSocket-based service for real-time dashboard updates, live metrics,
 * and instant notifications across the MBS analytics platform.
 * 
 * Features:
 * - WebSocket connection management with auto-reconnection
 * - Real-time KPI updates and metrics streaming
 * - Live audit trail updates
 * - Performance metrics broadcasting
 * - Connection state management
 * - Event subscription system
 */

export interface RealtimeEvent {
  type: 'kpi_update' | 'audit_log' | 'performance_metric' | 'system_status' | 'user_activity';
  timestamp: string;
  data: any;
  source?: string;
}

export interface KPIUpdateEvent {
  kpiId: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export interface AuditLogEvent {
  logEntry: {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    resource: string;
    status: 'success' | 'error' | 'warning';
    description: string;
  };
}

export interface PerformanceMetricEvent {
  metricName: string;
  value: number;
  timestamp: string;
  category: 'response_time' | 'accuracy' | 'throughput' | 'error_rate';
}

export interface SystemStatusEvent {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  message?: string;
  timestamp: string;
}

export type RealtimeEventType = 'kpi_update' | 'audit_log' | 'performance_metric' | 'system_status' | 'user_activity';

export type EventCallback = (event: RealtimeEvent) => void;

/**
 * Real-time Service Configuration
 */
interface RealtimeServiceConfig {
  /** WebSocket server URL */
  wsUrl: string;
  /** Auto-reconnection enabled */
  autoReconnect: boolean;
  /** Reconnection delay in milliseconds */
  reconnectDelayMs: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;
  /** Heartbeat interval in milliseconds */
  heartbeatIntervalMs: number;
}

/**
 * Connection state enumeration
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * Real-time Service Class
 */
class RealtimeService {
  private ws: WebSocket | null = null;
  private config: RealtimeServiceConfig;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private eventListeners = new Map<RealtimeEventType, Set<EventCallback>>();
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private statusListeners = new Set<(state: ConnectionState) => void>();

  constructor(config?: Partial<RealtimeServiceConfig>) {
    this.config = {
      wsUrl: 'ws://localhost:8080/realtime',
      autoReconnect: true,
      reconnectDelayMs: 5000,
      maxReconnectAttempts: 10,
      heartbeatIntervalMs: 30000,
      ...config
    };

    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.sendHeartbeat = this.sendHeartbeat.bind(this);
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[RealtimeService] Already connected');
      return;
    }

    this.setConnectionState(ConnectionState.CONNECTING);
    console.log('[RealtimeService] Connecting to', this.config.wsUrl);

    try {
      this.ws = new WebSocket(this.config.wsUrl);
      
      this.ws.onopen = () => {
        console.log('[RealtimeService] Connected successfully');
        this.setConnectionState(ConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        // Send initial subscription message
        this.send({
          type: 'subscribe',
          topics: ['kpi_updates', 'audit_logs', 'performance_metrics', 'system_status']
        });
      };

      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;

    } catch (error) {
      console.error('[RealtimeService] Connection error:', error);
      this.setConnectionState(ConnectionState.ERROR);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    console.log('[RealtimeService] Disconnecting...');
    
    this.config.autoReconnect = false;
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }

  /**
   * Subscribe to real-time events
   */
  public subscribe(eventType: RealtimeEventType, callback: EventCallback): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.statusListeners.add(callback);
    
    // Call immediately with current state
    callback(this.connectionState);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Send data through WebSocket
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[RealtimeService] Cannot send data - connection not open');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'heartbeat_response') {
        // Handle heartbeat response
        return;
      }

      // Create real-time event
      const realtimeEvent: RealtimeEvent = {
        type: data.type,
        timestamp: data.timestamp || new Date().toISOString(),
        data: data.payload || data.data,
        source: data.source || 'server'
      };

      // Notify listeners
      const listeners = this.eventListeners.get(data.type);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(realtimeEvent);
          } catch (error) {
            console.error('[RealtimeService] Error in event callback:', error);
          }
        });
      }

      // Log received event in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[RealtimeService] Received event:', data.type, realtimeEvent);
      }

    } catch (error) {
      console.error('[RealtimeService] Error parsing message:', error, event.data);
    }
  }

  /**
   * Handle WebSocket connection close
   */
  private handleClose(event: CloseEvent): void {
    console.log('[RealtimeService] Connection closed:', event.code, event.reason);
    
    this.stopHeartbeat();
    this.ws = null;
    
    if (event.code !== 1000 && this.config.autoReconnect) {
      this.setConnectionState(ConnectionState.RECONNECTING);
      this.scheduleReconnect();
    } else {
      this.setConnectionState(ConnectionState.DISCONNECTED);
    }
  }

  /**
   * Handle WebSocket errors
   */
  private handleError(event: Event): void {
    console.error('[RealtimeService] WebSocket error:', event);
    this.setConnectionState(ConnectionState.ERROR);
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.statusListeners.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('[RealtimeService] Error in status callback:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[RealtimeService] Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelayMs * Math.min(this.reconnectAttempts, 5); // Exponential backoff

    console.log(`[RealtimeService] Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Clear reconnection timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatIntervalMs);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send heartbeat message
   */
  private sendHeartbeat(): void {
    this.send({
      type: 'heartbeat',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Simulate real-time events for development/demo
   */
  public startMockDataStream(): void {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('[RealtimeService] Mock data stream is only available in development mode');
      return;
    }

    console.log('[RealtimeService] Starting mock data stream...');

    // Mock KPI updates
    setInterval(() => {
      const mockKPIEvent: RealtimeEvent = {
        type: 'kpi_update',
        timestamp: new Date().toISOString(),
        data: {
          kpiId: 'active_sessions',
          value: Math.floor(Math.random() * 50) + 20,
          previousValue: Math.floor(Math.random() * 50) + 15,
          unit: 'sessions',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }
      };
      
      this.eventListeners.get('kpi_update')?.forEach(callback => callback(mockKPIEvent));
    }, 15000);

    // Mock audit log events
    setInterval(() => {
      const actions = ['code_analysis', 'code_selection', 'export', 'bulk_operation'];
      const mockAuditEvent: RealtimeEvent = {
        type: 'audit_log',
        timestamp: new Date().toISOString(),
        data: {
          logEntry: {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: 'user123',
            action: actions[Math.floor(Math.random() * actions.length)],
            resource: 'MBS Analysis',
            status: Math.random() > 0.9 ? 'error' : 'success',
            description: 'Live audit event from mock data stream'
          }
        }
      };

      this.eventListeners.get('audit_log')?.forEach(callback => callback(mockAuditEvent));
    }, 8000);

    // Mock performance metrics
    setInterval(() => {
      const mockMetricEvent: RealtimeEvent = {
        type: 'performance_metric',
        timestamp: new Date().toISOString(),
        data: {
          metricName: 'response_time',
          value: Math.floor(Math.random() * 500) + 100,
          category: 'response_time'
        }
      };

      this.eventListeners.get('performance_metric')?.forEach(callback => callback(mockMetricEvent));
    }, 12000);
  }
}

// Create and export singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;