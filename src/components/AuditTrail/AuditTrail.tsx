/**
 * Audit Trail Component
 * 
 * Displays a comprehensive audit log of user actions and system events
 * in the MBS frontend application. Provides filtering, searching, and 
 * export capabilities for audit data.
 * 
 * Features:
 * - Real-time audit log display
 * - Action filtering and search
 * - Export audit data
 * - Session statistics
 * - Professional medical-grade UI
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  AuditLogEntry, 
  AuditTrailSummary, 
  AuditTrailFilters, 
  AuditActionType,
  AuditTrailExportConfig
} from '../../types/api.types';
import './AuditTrail.css';

interface AuditTrailProps {
  /** Array of audit log entries */
  auditLogs: AuditLogEntry[];
  /** Summary statistics */
  summary: AuditTrailSummary;
  /** Callback for exporting audit data */
  onExport?: (config: AuditTrailExportConfig) => void;
  /** Whether the component is in loading state */
  isLoading?: boolean;
  /** Maximum number of entries to display */
  maxEntries?: number;
  /** Whether to show summary statistics */
  showSummary?: boolean;
}

const AuditTrail: React.FC<AuditTrailProps> = ({
  auditLogs = [],
  summary,
  onExport,
  isLoading = false,
  maxEntries = 100,
  showSummary = true
}) => {
  // State management
  const [filters, setFilters] = useState<AuditTrailFilters>({});
  const [searchText, setSearchText] = useState('');
  const [selectedActionTypes, setSelectedActionTypes] = useState<AuditActionType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'html'>('csv');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Refs
  const logContainerRef = useRef<HTMLDivElement>(null);
  const lastLogCountRef = useRef(auditLogs.length);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && auditLogs.length > lastLogCountRef.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    lastLogCountRef.current = auditLogs.length;
  }, [auditLogs.length, autoScroll]);

  // Filter and search audit logs
  const filteredLogs = useMemo(() => {
    let filtered = [...auditLogs];

    // Apply action type filter
    if (selectedActionTypes.length > 0) {
      filtered = filtered.filter(log => selectedActionTypes.includes(log.action));
    }

    // Apply search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.metadata.code?.toLowerCase().includes(search) ||
        log.metadata.codes?.some(code => code.toLowerCase().includes(search))
      );
    }

    // Apply time range filter
    if (filters.timeRange) {
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        const start = new Date(filters.timeRange!.start);
        const end = new Date(filters.timeRange!.end);
        return logTime >= start && logTime <= end;
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit entries
    return filtered.slice(0, maxEntries);
  }, [auditLogs, selectedActionTypes, searchText, filters, maxEntries]);

  // Action type options for filtering
  const actionTypeOptions: { value: AuditActionType; label: string; category: string }[] = [
    { value: 'code_select', label: 'Code Selected', category: 'Selection' },
    { value: 'code_deselect', label: 'Code Deselected', category: 'Selection' },
    { value: 'bulk_select_all', label: 'Select All', category: 'Bulk Operations' },
    { value: 'bulk_clear_all', label: 'Clear All', category: 'Bulk Operations' },
    { value: 'bulk_select_category', label: 'Select by Category', category: 'Bulk Operations' },
    { value: 'bulk_select_compatible', label: 'Select Compatible', category: 'Bulk Operations' },
    { value: 'bulk_invert_selection', label: 'Invert Selection', category: 'Bulk Operations' },
    { value: 'analysis_start', label: 'Analysis Started', category: 'Analysis' },
    { value: 'analysis_complete', label: 'Analysis Completed', category: 'Analysis' },
    { value: 'analysis_error', label: 'Analysis Error', category: 'Analysis' },
    { value: 'export_data', label: 'Data Exported', category: 'Export' },
    { value: 'filter_apply', label: 'Filters Applied', category: 'Interface' },
    { value: 'preset_save', label: 'Preset Saved', category: 'Presets' },
    { value: 'preset_load', label: 'Preset Loaded', category: 'Presets' },
    { value: 'session_start', label: 'Session Started', category: 'Session' },
    { value: 'session_end', label: 'Session Ended', category: 'Session' },
  ];

  // Handle action type selection
  const handleActionTypeToggle = useCallback((actionType: AuditActionType) => {
    setSelectedActionTypes(prev => 
      prev.includes(actionType)
        ? prev.filter(type => type !== actionType)
        : [...prev, actionType]
    );
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    if (!onExport) return;

    const config: AuditTrailExportConfig = {
      format: exportFormat,
      includeMetadata: true,
      includeSummary: showSummary,
      actionTypes: selectedActionTypes.length > 0 ? selectedActionTypes : undefined,
      timeRange: filters.timeRange
    };

    onExport(config);
  }, [exportFormat, showSummary, selectedActionTypes, filters.timeRange, onExport]);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    
    return date.toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Get icon for action type
  const getActionIcon = useCallback((action: AuditActionType) => {
    const iconMap: Record<AuditActionType, string> = {
      code_select: '✅',
      code_deselect: '❌',
      bulk_select_all: '☑️',
      bulk_clear_all: '🗑️',
      bulk_select_category: '📂',
      bulk_select_compatible: '🔗',
      bulk_invert_selection: '🔄',
      analysis_start: '🔍',
      analysis_complete: '✨',
      analysis_error: '⚠️',
      export_data: '💾',
      filter_apply: '🔎',
      preset_save: '💼',
      preset_load: '📋',
      session_start: '🟢',
      session_end: '🔴'
    };
    return iconMap[action] || '📝';
  }, []);

  // Get action color
  const getActionColor = useCallback((action: AuditActionType) => {
    if (action.includes('select')) return 'success';
    if (action.includes('deselect') || action.includes('clear')) return 'warning';
    if (action.includes('error')) return 'error';
    if (action.includes('analysis')) return 'primary';
    return 'neutral';
  }, []);

  return (
    <div className="audit-trail">
      {/* Header */}
      <div className="audit-header">
        <div className="audit-title">
          <span className="audit-icon">📊</span>
          <h3>Audit Trail</h3>
          {filteredLogs.length !== auditLogs.length && (
            <span className="filter-badge">{filteredLogs.length}/{auditLogs.length} entries</span>
          )}
        </div>
        
        <div className="audit-controls">
          <button
            type="button"
            className="control-button"
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Filters"
          >
            <span className="button-icon">🔧</span>
            Filters
          </button>
          
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Summary Statistics */}
      {showSummary && (
        <div className="audit-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-value">{summary.totalActions}</span>
              <span className="summary-label">Total Actions</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{summary.selectionsCount}</span>
              <span className="summary-label">Selections</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{summary.deselectionsCount}</span>
              <span className="summary-label">Deselections</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{summary.exportsCount}</span>
              <span className="summary-label">Exports</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{Math.round(summary.sessionDurationSeconds / 60)}m</span>
              <span className="summary-label">Session Time</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="audit-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search actions, codes, descriptions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Export Format</label>
              <select
                className="filter-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'html')}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
              </select>
            </div>
            
            <button
              type="button"
              className="export-button"
              onClick={handleExport}
              disabled={!onExport || filteredLogs.length === 0}
              title="Export Audit Data"
            >
              <span className="button-icon">💾</span>
              Export
            </button>
          </div>

          <div className="action-type-filters">
            <span className="filter-label">Action Types:</span>
            <div className="action-type-buttons">
              {actionTypeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`action-type-button ${selectedActionTypes.includes(option.value) ? 'active' : ''}`}
                  onClick={() => handleActionTypeToggle(option.value)}
                  title={option.label}
                >
                  {getActionIcon(option.value)} {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Entries */}
      <div 
        className="audit-logs"
        ref={logContainerRef}
        onScroll={(e) => {
          const element = e.currentTarget;
          const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
          setAutoScroll(isAtBottom);
        }}
      >
        {isLoading && (
          <div className="loading-message">
            <span className="loading-icon">⏳</span>
            Loading audit data...
          </div>
        )}
        
        {!isLoading && filteredLogs.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <p>No audit entries found</p>
            <small>User actions and system events will appear here</small>
          </div>
        )}
        
        {filteredLogs.map((entry) => (
          <div key={entry.id} className={`audit-entry ${getActionColor(entry.action)}`}>
            <div className="entry-header">
              <div className="entry-icon">
                {getActionIcon(entry.action)}
              </div>
              <div className="entry-info">
                <span className="entry-action">{entry.description}</span>
                <span className="entry-timestamp">{formatTimestamp(entry.timestamp)}</span>
              </div>
              {entry.metadata.code && (
                <div className="entry-code">
                  Code: {entry.metadata.code}
                </div>
              )}
            </div>
            
            {/* Entry Metadata */}
            {(entry.metadata.codes || entry.metadata.newState || entry.metadata.export || entry.metadata.error) && (
              <div className="entry-metadata">
                {entry.metadata.codes && entry.metadata.codes.length > 0 && (
                  <div className="metadata-item">
                    <strong>Codes:</strong> {entry.metadata.codes.join(', ')}
                  </div>
                )}
                
                {entry.metadata.newState && (
                  <div className="metadata-item">
                    <strong>Selection:</strong> {entry.metadata.newState.selectedCodes.length} codes, 
                    ${entry.metadata.newState.totalFee.toFixed(2)} total
                  </div>
                )}
                
                {entry.metadata.export && (
                  <div className="metadata-item">
                    <strong>Export:</strong> {entry.metadata.export.codeCount} codes as {entry.metadata.export.format.toUpperCase()}
                  </div>
                )}
                
                {entry.metadata.error && (
                  <div className="metadata-item error">
                    <strong>Error:</strong> {entry.metadata.error.message}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrail;