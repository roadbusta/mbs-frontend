/**
 * Audit Service
 * 
 * Provides comprehensive audit trail functionality for the MBS frontend application.
 * Tracks user actions, system events, and maintains audit logs for compliance and
 * debugging purposes.
 * 
 * Features:
 * - Real-time action tracking
 * - Session management
 * - Local storage persistence
 * - Export capabilities
 * - Statistics generation
 */

import { 
  AuditLogEntry, 
  AuditActionType, 
  AuditTrailSummary,
  AuditTrailExportConfig
} from '../types/api.types';

/**
 * Audit Service Configuration
 */
interface AuditServiceConfig {
  /** Maximum number of audit entries to keep in memory */
  maxEntries: number;
  /** Whether to persist audit logs to localStorage */
  enablePersistence: boolean;
  /** Storage key for localStorage */
  storageKey: string;
  /** Session timeout in milliseconds */
  sessionTimeoutMs: number;
}

/**
 * Default configuration for the audit service
 */
const DEFAULT_CONFIG: AuditServiceConfig = {
  maxEntries: 1000,
  enablePersistence: true,
  storageKey: 'mbs_audit_logs',
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
};

/**
 * Audit Service Class
 */
class AuditService {
  private config: AuditServiceConfig;
  private logs: AuditLogEntry[] = [];
  private sessionId: string;
  private sessionStartTime: Date;
  private listeners: Array<(logs: AuditLogEntry[]) => void> = [];

  constructor(config: Partial<AuditServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    
    // Load persisted logs
    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }
    
    // Start session
    this.logAction('session_start', 'Session started');
    
    // Set up session timeout
    this.setupSessionTimeout();
    
    // Clean up old logs periodically
    this.setupLogCleanup();
  }

  /**
   * Log a user or system action
   */
  public logAction(
    action: AuditActionType,
    description: string,
    metadata: Partial<AuditLogEntry['metadata']> = {}
  ): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      action,
      description,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata: {
        ...metadata
      }
    };

    // Add to logs array
    this.logs.push(entry);

    // Trim logs if exceeded max entries
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    // Persist to storage
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    // Notify listeners
    this.notifyListeners();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Audit] ${action}: ${description}`, metadata);
    }
  }

  /**
   * Log code selection action
   */
  public logCodeSelection(
    code: string,
    description: string,
    previousState?: { selectedCodes: string[]; totalFee: number },
    newState?: { selectedCodes: string[]; totalFee: number }
  ): void {
    this.logAction('code_select', `Selected code ${code}: ${description}`, {
      code,
      previousState,
      newState
    });
  }

  /**
   * Log code deselection action
   */
  public logCodeDeselection(
    code: string,
    description: string,
    previousState?: { selectedCodes: string[]; totalFee: number },
    newState?: { selectedCodes: string[]; totalFee: number }
  ): void {
    this.logAction('code_deselect', `Deselected code ${code}: ${description}`, {
      code,
      previousState,
      newState
    });
  }

  /**
   * Log bulk operation
   */
  public logBulkOperation(
    operationType: string,
    description: string,
    affectedCodes: string[],
    previousState?: { selectedCodes: string[]; totalFee: number },
    newState?: { selectedCodes: string[]; totalFee: number }
  ): void {
    const actionMap: Record<string, AuditActionType> = {
      'select_all': 'bulk_select_all',
      'clear_all': 'bulk_clear_all',
      'select_by_category': 'bulk_select_category',
      'select_compatible': 'bulk_select_compatible',
      'invert_selection': 'bulk_invert_selection'
    };

    const action = actionMap[operationType] || 'bulk_select_all';

    this.logAction(action, description, {
      codes: affectedCodes,
      previousState,
      newState
    });
  }

  /**
   * Log analysis action
   */
  public logAnalysis(
    phase: 'start' | 'complete' | 'error',
    consultationLength: number,
    context?: string,
    processingTimeMs?: number,
    recommendationCount?: number,
    error?: { message: string; code?: string }
  ): void {
    const actionMap = {
      start: 'analysis_start' as AuditActionType,
      complete: 'analysis_complete' as AuditActionType,
      error: 'analysis_error' as AuditActionType
    };

    const descriptions = {
      start: `Started analysis of ${consultationLength} character consultation`,
      complete: `Completed analysis - ${recommendationCount} recommendations in ${processingTimeMs}ms`,
      error: `Analysis failed: ${error?.message}`
    };

    this.logAction(actionMap[phase], descriptions[phase], {
      analysis: {
        consultationLength,
        context: context as any,
        processingTimeMs,
        recommendationCount
      },
      error
    });
  }

  /**
   * Log export action
   */
  public logExport(
    format: string,
    codeCount: number,
    filename?: string
  ): void {
    this.logAction('export_data', `Exported ${codeCount} codes as ${format.toUpperCase()}`, {
      export: {
        format: format as any,
        codeCount,
        filename
      }
    });
  }

  /**
   * Log filter application
   */
  public logFilterApplication(filterDetails: any): void {
    this.logAction('filter_apply', 'Applied filters to code recommendations', {
      filters: filterDetails
    });
  }

  /**
   * Get all audit logs
   */
  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get filtered logs
   */
  public getFilteredLogs(
    actionTypes?: AuditActionType[],
    searchText?: string,
    timeRange?: { start: string; end: string }
  ): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (actionTypes && actionTypes.length > 0) {
      filtered = filtered.filter(log => actionTypes.includes(log.action));
    }

    if (searchText && searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.metadata.code?.toLowerCase().includes(search)
      );
    }

    if (timeRange) {
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= start && logTime <= end;
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Generate audit trail summary statistics
   */
  public generateSummary(): AuditTrailSummary {
    const now = new Date();
    const sessionDurationSeconds = Math.floor(
      (now.getTime() - this.sessionStartTime.getTime()) / 1000
    );

    // Count actions by type
    const actionCounts = this.logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<AuditActionType, number>);

    // Find most frequent action
    const mostFrequentAction = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as AuditActionType || 'session_start';

    // Count specific action types
    const selectionsCount = (actionCounts.code_select || 0) + 
                           (actionCounts.bulk_select_all || 0) + 
                           (actionCounts.bulk_select_category || 0) + 
                           (actionCounts.bulk_select_compatible || 0);

    const deselectionsCount = (actionCounts.code_deselect || 0) + 
                             (actionCounts.bulk_clear_all || 0);

    const exportsCount = actionCounts.export_data || 0;

    // Count unique codes analyzed
    const analyzedCodes = new Set<string>();
    this.logs.forEach(log => {
      if (log.metadata.code) analyzedCodes.add(log.metadata.code);
      if (log.metadata.codes) log.metadata.codes.forEach(code => analyzedCodes.add(code));
    });

    return {
      totalActions: this.logs.length,
      sessionDurationSeconds,
      mostFrequentAction,
      codesAnalyzed: analyzedCodes.size,
      selectionsCount,
      deselectionsCount,
      exportsCount,
      sessionStartTime: this.sessionStartTime.toISOString(),
      lastActivityTime: this.logs[this.logs.length - 1]?.timestamp || this.sessionStartTime.toISOString()
    };
  }

  /**
   * Export audit data
   */
  public exportAuditData(config: AuditTrailExportConfig): string {
    const logs = this.getFilteredLogs(
      config.actionTypes,
      undefined,
      config.timeRange
    );

    const summary = config.includeSummary ? this.generateSummary() : null;

    switch (config.format) {
      case 'csv':
        return this.exportToCSV(logs, summary, config.includeMetadata);
      case 'json':
        return this.exportToJSON(logs, summary, config.includeMetadata);
      case 'html':
        return this.exportToHTML(logs, summary, config.includeMetadata);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  /**
   * Subscribe to audit log updates
   */
  public subscribe(listener: (logs: AuditLogEntry[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Clear all audit logs
   */
  public clearLogs(): void {
    this.logs = [];
    if (this.config.enablePersistence) {
      this.saveToStorage();
    }
    this.notifyListeners();
  }

  /**
   * End the current session
   */
  public endSession(): void {
    this.logAction('session_end', 'Session ended');
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Only load logs from the last 24 hours to prevent memory issues
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.logs = data.filter((log: AuditLogEntry) => 
          new Date(log.timestamp) > cutoff
        );
      }
    } catch (error) {
      console.warn('Failed to load audit logs from storage:', error);
      this.logs = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save audit logs to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.logs]);
      } catch (error) {
        console.error('Error notifying audit log listener:', error);
      }
    });
  }

  private setupSessionTimeout(): void {
    setTimeout(() => {
      this.logAction('session_end', 'Session timed out');
    }, this.config.sessionTimeoutMs);
  }

  private setupLogCleanup(): void {
    // Clean up old logs every 5 minutes
    setInterval(() => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const originalLength = this.logs.length;
      this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoff);
      
      if (this.logs.length < originalLength && this.config.enablePersistence) {
        this.saveToStorage();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private exportToCSV(
    logs: AuditLogEntry[], 
    summary: AuditTrailSummary | null, 
    includeMetadata: boolean
  ): string {
    const headers = ['Timestamp', 'Action', 'Description', 'Session ID'];
    if (includeMetadata) {
      headers.push('Code', 'Codes', 'Previous State', 'New State', 'Error');
    }

    let csv = headers.join(',') + '\n';

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.action,
        `"${log.description.replace(/"/g, '""')}"`,
        log.sessionId
      ];

      if (includeMetadata) {
        row.push(
          log.metadata.code || '',
          log.metadata.codes?.join(';') || '',
          log.metadata.previousState ? JSON.stringify(log.metadata.previousState) : '',
          log.metadata.newState ? JSON.stringify(log.metadata.newState) : '',
          log.metadata.error?.message || ''
        );
      }

      csv += row.join(',') + '\n';
    });

    if (summary) {
      csv += '\n\nSummary Statistics\n';
      csv += `Total Actions,${summary.totalActions}\n`;
      csv += `Session Duration (seconds),${summary.sessionDurationSeconds}\n`;
      csv += `Most Frequent Action,${summary.mostFrequentAction}\n`;
      csv += `Codes Analyzed,${summary.codesAnalyzed}\n`;
      csv += `Selections Count,${summary.selectionsCount}\n`;
      csv += `Deselections Count,${summary.deselectionsCount}\n`;
      csv += `Exports Count,${summary.exportsCount}\n`;
    }

    return csv;
  }

  private exportToJSON(
    logs: AuditLogEntry[], 
    summary: AuditTrailSummary | null, 
    includeMetadata: boolean
  ): string {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      logs: includeMetadata ? logs : logs.map(log => ({
        id: log.id,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp,
        sessionId: log.sessionId
      }))
    };

    if (summary) {
      exportData.summary = summary;
    }

    return JSON.stringify(exportData, null, 2);
  }

  private exportToHTML(
    logs: AuditLogEntry[], 
    summary: AuditTrailSummary | null, 
    includeMetadata: boolean
  ): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>MBS Frontend Audit Trail</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .log-entry { border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px; }
        .timestamp { color: #666; font-size: 0.9em; }
        .action { font-weight: bold; color: #0066cc; }
        .metadata { background: #f9f9f9; padding: 8px; margin-top: 8px; border-radius: 3px; font-size: 0.9em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MBS Frontend Audit Trail</h1>
        <p>Export Date: ${new Date().toLocaleString()}</p>
        <p>Session ID: ${this.sessionId}</p>
        <p>Total Entries: ${logs.length}</p>
    </div>`;

    if (summary) {
      html += `
    <div class="summary">
        <h2>Summary Statistics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Actions</td><td>${summary.totalActions}</td></tr>
            <tr><td>Session Duration</td><td>${Math.round(summary.sessionDurationSeconds / 60)} minutes</td></tr>
            <tr><td>Most Frequent Action</td><td>${summary.mostFrequentAction}</td></tr>
            <tr><td>Codes Analyzed</td><td>${summary.codesAnalyzed}</td></tr>
            <tr><td>Selections Count</td><td>${summary.selectionsCount}</td></tr>
            <tr><td>Deselections Count</td><td>${summary.deselectionsCount}</td></tr>
            <tr><td>Exports Count</td><td>${summary.exportsCount}</td></tr>
        </table>
    </div>`;
    }

    html += '<div class="logs"><h2>Audit Log Entries</h2>';

    logs.forEach(log => {
      html += `
    <div class="log-entry">
        <div class="timestamp">${new Date(log.timestamp).toLocaleString()}</div>
        <div class="action">${log.action}</div>
        <div class="description">${log.description}</div>`;

      if (includeMetadata && Object.keys(log.metadata).length > 0) {
        html += '<div class="metadata">';
        html += '<strong>Metadata:</strong><br>';
        html += JSON.stringify(log.metadata, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div></body></html>';

    return html;
  }
}

// Create and export singleton instance
const auditServiceInstance = new AuditService();

export default auditServiceInstance;

/**
 * Audit Service API for React Hooks
 * Provides Promise-based interface for async operations
 */
export const auditService = {
  // Async data retrieval methods
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    return Promise.resolve(auditServiceInstance.getLogs());
  },

  getAuditSummary: async (): Promise<AuditTrailSummary> => {
    return Promise.resolve(auditServiceInstance.generateSummary());
  },

  getFilteredAuditLogs: async (filters: any): Promise<AuditLogEntry[]> => {
    return Promise.resolve(auditServiceInstance.getFilteredLogs(filters));
  },

  exportAuditData: async (config: AuditTrailExportConfig): Promise<void> => {
    const exportData = auditServiceInstance.exportAuditData(config);
    
    // Create and download the export file
    let filename = `audit_export_${new Date().toISOString().split('T')[0]}`;
    let mimeType = 'application/json';
    
    switch (config.format) {
      case 'csv':
        filename += '.csv';
        mimeType = 'text/csv';
        break;
      case 'html':
        filename += '.html';
        mimeType = 'text/html';
        break;
      case 'json':
      default:
        filename += '.json';
        mimeType = 'application/json';
        break;
    }
    
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return Promise.resolve();
  },

  // Subscription method for real-time updates
  subscribe: (listener: (logs: AuditLogEntry[]) => void): (() => void) => {
    return auditServiceInstance.subscribe(listener);
  },

  // Action logging methods (pass through to instance)
  logAction: (action: AuditActionType, description: string, metadata?: any): void => {
    auditServiceInstance.logAction(action, description, metadata);
  },

  logCodeSelection: (code: string, description: string, previousState?: any, newState?: any): void => {
    auditServiceInstance.logCodeSelection(code, description, previousState, newState);
  },

  logAnalysis: (phase: 'start' | 'complete' | 'error', consultationLength: number, context?: string, processingTimeMs?: number, recommendationCount?: number, error?: any): void => {
    auditServiceInstance.logAnalysis(phase, consultationLength, context, processingTimeMs, recommendationCount, error);
  },

  logExport: (format: string, codeCount: number, filename?: string): void => {
    auditServiceInstance.logExport(format, codeCount, filename);
  }
};