/**
 * Audit Service Hook
 * 
 * Custom React hook for managing audit data, providing a clean interface
 * for audit trail operations, compliance monitoring, and data export.
 * 
 * Features:
 * - Audit log retrieval and filtering
 * - Real-time audit data updates
 * - Compliance metrics calculation
 * - Export functionality
 * - Error handling and loading states
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  AuditLogEntry, 
  AuditTrailSummary, 
  AuditTrailExportConfig,
  AuditTrailFilters 
} from '../types/api.types';
import { auditService } from '../services/auditService';

export interface UseAuditServiceReturn {
  // Data
  auditLogs: AuditLogEntry[];
  summary: AuditTrailSummary | null;
  
  // Loading states
  isLoading: boolean;
  isExporting: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  exportData: (config: AuditTrailExportConfig) => Promise<void>;
  filterLogs: (filters: AuditTrailFilters) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for audit service operations
 */
export const useAuditService = (
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
): UseAuditServiceReturn => {
  // State management
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [summary, setSummary] = useState<AuditTrailSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error handler
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh audit data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch audit logs and summary in parallel
      const [logs, summaryData] = await Promise.all([
        auditService.getAuditLogs(),
        auditService.getAuditSummary()
      ]);
      
      setAuditLogs(logs);
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audit data';
      setError(errorMessage);
      console.error('Audit data refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export audit data
  const exportData = useCallback(async (config: AuditTrailExportConfig) => {
    setIsExporting(true);
    setError(null);
    
    try {
      await auditService.exportAuditData(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export audit data';
      setError(errorMessage);
      console.error('Audit data export failed:', err);
      throw err; // Re-throw to allow component to handle
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Filter audit logs
  const filterLogs = useCallback(async (filters: AuditTrailFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filteredLogs = await auditService.getFilteredAuditLogs(filters);
      setAuditLogs(filteredLogs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter audit logs';
      setError(errorMessage);
      console.error('Audit log filtering failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  return {
    // Data
    auditLogs,
    summary,
    
    // Loading states
    isLoading,
    isExporting,
    
    // Error handling
    error,
    
    // Actions
    refreshData,
    exportData,
    filterLogs,
    clearError
  };
};