/**
 * Real-time Updates Hook
 * 
 * React hook for subscribing to real-time dashboard updates, managing
 * connection state, and handling live data streams across the application.
 * 
 * Features:
 * - Real-time event subscriptions
 * - Connection state management
 * - Automatic reconnection handling
 * - Type-safe event handling
 * - Performance optimization with cleanup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import realtimeService, { 
  RealtimeEvent, 
  RealtimeEventType, 
  ConnectionState,
  KPIUpdateEvent,
  AuditLogEvent,
  PerformanceMetricEvent,
  SystemStatusEvent
} from '../services/realtimeService';

export interface UseRealtimeUpdatesOptions {
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Whether to start mock data stream in development */
  enableMockData?: boolean;
  /** Event types to subscribe to */
  subscriptions?: RealtimeEventType[];
}

export interface UseRealtimeUpdatesReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  
  // Connection controls
  connect: () => void;
  disconnect: () => void;
  
  // Event data (latest received events)
  latestKPIUpdate: KPIUpdateEvent | null;
  latestAuditLog: AuditLogEvent | null;
  latestPerformanceMetric: PerformanceMetricEvent | null;
  latestSystemStatus: SystemStatusEvent | null;
  
  // Event history (for displaying recent events)
  recentKPIUpdates: KPIUpdateEvent[];
  recentAuditLogs: AuditLogEvent[];
  recentPerformanceMetrics: PerformanceMetricEvent[];
  
  // Event subscription method
  subscribe: (eventType: RealtimeEventType, callback: (event: RealtimeEvent) => void) => () => void;
  
  // Statistics
  eventsReceived: number;
  connectionUptime: number;
}

/**
 * Custom hook for real-time updates
 */
export const useRealtimeUpdates = (
  options: UseRealtimeUpdatesOptions = {}
): UseRealtimeUpdatesReturn => {
  const {
    autoConnect = true,
    enableMockData = process.env.NODE_ENV === 'development',
    subscriptions = ['kpi_update', 'audit_log', 'performance_metric', 'system_status']
  } = options;

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  
  // Latest events
  const [latestKPIUpdate, setLatestKPIUpdate] = useState<KPIUpdateEvent | null>(null);
  const [latestAuditLog, setLatestAuditLog] = useState<AuditLogEvent | null>(null);
  const [latestPerformanceMetric, setLatestPerformanceMetric] = useState<PerformanceMetricEvent | null>(null);
  const [latestSystemStatus, setLatestSystemStatus] = useState<SystemStatusEvent | null>(null);
  
  // Event history (keeping last 10 events of each type)
  const [recentKPIUpdates, setRecentKPIUpdates] = useState<KPIUpdateEvent[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEvent[]>([]);
  const [recentPerformanceMetrics, setRecentPerformanceMetrics] = useState<PerformanceMetricEvent[]>([]);
  
  // Statistics
  const [eventsReceived, setEventsReceived] = useState(0);
  const [connectionUptime, setConnectionUptime] = useState(0);
  
  // Refs for cleanup
  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const statusUnsubscribeRef = useRef<(() => void) | null>(null);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mockDataStartedRef = useRef(false);

  // Computed values
  const isConnected = connectionState === ConnectionState.CONNECTED;

  // Connection controls
  const connect = useCallback(() => {
    realtimeService.connect();
  }, []);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  // Event subscription method
  const subscribe = useCallback((eventType: RealtimeEventType, callback: (event: RealtimeEvent) => void) => {
    return realtimeService.subscribe(eventType, callback);
  }, []);

  // Event handlers
  const handleKPIUpdate = useCallback((event: RealtimeEvent) => {
    const kpiData = event.data as KPIUpdateEvent;
    setLatestKPIUpdate(kpiData);
    setRecentKPIUpdates(prev => [kpiData, ...prev.slice(0, 9)]);
    setEventsReceived(prev => prev + 1);
  }, []);

  const handleAuditLog = useCallback((event: RealtimeEvent) => {
    const auditData = event.data as AuditLogEvent;
    setLatestAuditLog(auditData);
    setRecentAuditLogs(prev => [auditData, ...prev.slice(0, 9)]);
    setEventsReceived(prev => prev + 1);
  }, []);

  const handlePerformanceMetric = useCallback((event: RealtimeEvent) => {
    const metricData = event.data as PerformanceMetricEvent;
    setLatestPerformanceMetric(metricData);
    setRecentPerformanceMetrics(prev => [metricData, ...prev.slice(0, 9)]);
    setEventsReceived(prev => prev + 1);
  }, []);

  const handleSystemStatus = useCallback((event: RealtimeEvent) => {
    const statusData = event.data as SystemStatusEvent;
    setLatestSystemStatus(statusData);
    setEventsReceived(prev => prev + 1);
  }, []);

  // Connection state change handler
  const handleConnectionStateChange = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    
    if (state === ConnectionState.CONNECTED) {
      setConnectionStartTime(Date.now());
    } else {
      setConnectionStartTime(null);
      setConnectionUptime(0);
    }
  }, []);

  // Setup effect
  useEffect(() => {
    // Subscribe to connection state changes
    statusUnsubscribeRef.current = realtimeService.onConnectionStateChange(handleConnectionStateChange);
    
    // Subscribe to events
    if (subscriptions.includes('kpi_update')) {
      unsubscribeRefs.current.push(realtimeService.subscribe('kpi_update', handleKPIUpdate));
    }
    
    if (subscriptions.includes('audit_log')) {
      unsubscribeRefs.current.push(realtimeService.subscribe('audit_log', handleAuditLog));
    }
    
    if (subscriptions.includes('performance_metric')) {
      unsubscribeRefs.current.push(realtimeService.subscribe('performance_metric', handlePerformanceMetric));
    }
    
    if (subscriptions.includes('system_status')) {
      unsubscribeRefs.current.push(realtimeService.subscribe('system_status', handleSystemStatus));
    }

    // Auto-connect if enabled
    if (autoConnect) {
      realtimeService.connect();
    }

    // Start mock data stream if enabled (only once)
    if (enableMockData && !mockDataStartedRef.current) {
      realtimeService.startMockDataStream();
      mockDataStartedRef.current = true;
    }

    // Cleanup function
    return () => {
      // Unsubscribe from all events
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      unsubscribeRefs.current = [];
      
      // Unsubscribe from status changes
      if (statusUnsubscribeRef.current) {
        statusUnsubscribeRef.current();
        statusUnsubscribeRef.current = null;
      }
      
      // Clear uptime interval
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        uptimeIntervalRef.current = null;
      }
    };
  }, [
    autoConnect,
    enableMockData,
    subscriptions,
    handleKPIUpdate,
    handleAuditLog,
    handlePerformanceMetric,
    handleSystemStatus,
    handleConnectionStateChange
  ]);

  // Connection uptime tracking
  useEffect(() => {
    if (isConnected && connectionStartTime) {
      uptimeIntervalRef.current = setInterval(() => {
        setConnectionUptime(Math.floor((Date.now() - connectionStartTime) / 1000));
      }, 1000);
    } else {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        uptimeIntervalRef.current = null;
      }
    }

    return () => {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
    };
  }, [isConnected, connectionStartTime]);

  return {
    // Connection state
    connectionState,
    isConnected,
    
    // Connection controls
    connect,
    disconnect,
    
    // Latest events
    latestKPIUpdate,
    latestAuditLog,
    latestPerformanceMetric,
    latestSystemStatus,
    
    // Event history
    recentKPIUpdates,
    recentAuditLogs,
    recentPerformanceMetrics,
    
    // Event subscription
    subscribe,
    
    // Statistics
    eventsReceived,
    connectionUptime
  };
};

export default useRealtimeUpdates;