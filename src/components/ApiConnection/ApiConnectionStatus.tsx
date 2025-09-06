/**
 * API Connection Status Component
 * 
 * Shows real API connection status and allows testing/configuration
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './ApiConnectionStatus.css';

interface ConnectionStatus {
  connected: boolean;
  latency: number;
  error?: string;
  lastChecked?: Date;
}

const ApiConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(false);

  useEffect(() => {
    setApiEnabled(apiClient.isRealApiEnabled);
    if (apiClient.isRealApiEnabled) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.testConnection();
      setStatus({
        ...result,
        lastChecked: new Date()
      });
    } catch (error) {
      setStatus({
        connected: false,
        latency: 0,
        error: error instanceof Error ? error.message : 'Connection test failed',
        lastChecked: new Date()
      });
    }
    setIsLoading(false);
  };

  const getStatusIcon = () => {
    if (isLoading) return '🔄';
    if (!apiEnabled) return '📱';
    if (!status) return '❓';
    return status.connected ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (!apiEnabled) return 'Mock Data Mode';
    if (isLoading) return 'Testing connection...';
    if (!status) return 'Not tested';
    return status.connected 
      ? `Connected (${status.latency}ms)` 
      : `Disconnected: ${status.error}`;
  };

  const getStatusClass = () => {
    if (!apiEnabled) return 'api-status--mock';
    if (isLoading) return 'api-status--testing';
    if (!status) return 'api-status--unknown';
    return status.connected ? 'api-status--connected' : 'api-status--error';
  };

  return (
    <div className={`api-connection-status ${getStatusClass()}`}>
      <div className="status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <div className="status-info">
          <div className="status-text">{getStatusText()}</div>
          {status?.lastChecked && (
            <div className="status-time">
              Last checked: {status.lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="status-actions">
        {apiEnabled && (
          <button
            className="test-connection-btn"
            onClick={testConnection}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        )}
        
        <button
          className="clear-cache-btn"
          onClick={() => apiClient.clearCache()}
          title="Clear API cache"
        >
          Clear Cache
        </button>
      </div>

      {!apiEnabled && (
        <div className="api-config-hint">
          <p>To enable real API data:</p>
          <ol>
            <li>Set <code>VITE_API_URL</code> in your .env file</li>
            <li>Set <code>VITE_API_KEY</code> for authentication</li>
            <li>Set <code>VITE_ENABLE_REAL_API=true</code></li>
            <li>Restart the development server</li>
          </ol>
        </div>
      )}

      {apiEnabled && !status?.connected && status?.error && (
        <div className="api-error-details">
          <strong>Connection Error:</strong>
          <p>{status.error}</p>
          <details>
            <summary>Configuration</summary>
            <ul>
              <li>API URL: {import.meta.env.VITE_API_URL || 'Not set'}</li>
              <li>API Key: {import.meta.env.VITE_API_KEY ? '***configured***' : 'Not set'}</li>
              <li>Real API Enabled: {import.meta.env.VITE_ENABLE_REAL_API || 'false'}</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
};

export default ApiConnectionStatus;