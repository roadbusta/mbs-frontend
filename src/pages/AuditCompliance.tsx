/**
 * Audit & Compliance Page
 * 
 * Comprehensive audit and compliance dashboard integrating audit trail,
 * compliance metrics, and regulatory reporting functionality.
 * 
 * Features:
 * - Complete audit trail with filtering and search
 * - Compliance dashboard with KPI metrics
 * - Regulatory reporting and export capabilities
 * - Real-time audit log updates
 * - Professional medical-grade UI
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  AuditLogEntry, 
  AuditTrailSummary, 
  AuditTrailExportConfig,
  ComplianceMetrics,
  ReportConfiguration,
  SelectionState,
  EnhancedCodeRecommendation,
  ConsultationContext
} from '../types/api.types';
import AuditTrail from '../components/AuditTrail/AuditTrail';
import KPICard from '../components/KPICards/KPICard';
import ExportButton from '../components/ExportButton/ExportButton';
import { useAuditService } from '../hooks/useAuditService';
import './AuditCompliance.css';

interface ComplianceKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'success' | 'warning' | 'error' | 'info';
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  icon: string;
}

const AuditCompliance: React.FC = () => {
  // Audit state management
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditTrailSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Compliance metrics state
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Custom hook for audit service (if available)
  const auditService = useAuditService();

  // Mock data generation for demonstration
  const generateMockAuditLogs = useCallback((): AuditLogEntry[] => {
    const mockLogs: AuditLogEntry[] = [
      {
        id: 'audit_001',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        userId: 'user123',
        userEmail: 'doctor@clinic.com',
        action: 'code_analysis',
        resource: 'MBS Analysis',
        details: {
          consultationLength: 1200,
          recommendationCount: 5,
          processingTimeMs: 2340
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        sessionId: 'session_abc123'
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        userId: 'user123',
        userEmail: 'doctor@clinic.com',
        action: 'code_selection',
        resource: 'Item 23',
        details: {
          codeCount: 1
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        sessionId: 'session_abc123'
      },
      {
        id: 'audit_003',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        userId: 'user123',
        userEmail: 'doctor@clinic.com',
        action: 'export',
        resource: 'Selection Export',
        details: {
          format: 'csv',
          codeCount: 3,
          filename: 'mbs_selection_20250830.csv'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        sessionId: 'session_abc123'
      }
    ];
    return mockLogs;
  }, []);

  const generateMockAuditSummary = useCallback((): AuditTrailSummary => {
    return {
      totalActions: 847,
      sessionDurationSeconds: 2340,
      mostFrequentAction: 'code_analysis',
      codesAnalyzed: 156,
      selectionsCount: 89,
      deselectionsCount: 12,
      exportsCount: 23,
      sessionStartTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      lastActivityTime: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    };
  }, []);

  // Compliance KPIs with mock data
  const complianceKPIs: ComplianceKPI[] = useMemo(() => [
    {
      id: 'medicare_compliance',
      title: 'Medicare Compliance',
      value: 97.8,
      unit: '%',
      trend: 'up',
      trendValue: 2.1,
      status: 'success',
      description: 'Percentage of codes meeting Medicare compliance requirements',
      color: 'green',
      icon: '🏥'
    },
    {
      id: 'audit_success_rate',
      title: 'Audit Success Rate',
      value: 94.3,
      unit: '%',
      trend: 'stable',
      trendValue: 0.3,
      status: 'success',
      description: 'Success rate of internal and external audits',
      color: 'blue',
      icon: '✅'
    },
    {
      id: 'variance_rate',
      title: 'Code Variance',
      value: 3.2,
      unit: '%',
      trend: 'down',
      trendValue: -0.8,
      status: 'warning',
      description: 'Percentage variance from expected coding patterns',
      color: 'orange',
      icon: '📊'
    },
    {
      id: 'documentation_score',
      title: 'Documentation Quality',
      value: 91.7,
      unit: '/100',
      trend: 'up',
      trendValue: 1.4,
      status: 'success',
      description: 'Average documentation quality score',
      color: 'purple',
      icon: '📋'
    }
  ], []);

  // Load audit data
  const loadAuditData = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the audit service
      // const logs = await auditService.getAuditLogs();
      // const summary = await auditService.getAuditSummary();
      
      // Using mock data for demonstration
      const logs = generateMockAuditLogs();
      const summary = generateMockAuditSummary();
      
      setAuditLogs(logs);
      setAuditSummary(summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockAuditLogs, generateMockAuditSummary]);

  // Handle audit export
  const handleAuditExport = useCallback(async (config: AuditTrailExportConfig) => {
    try {
      console.log('Exporting audit data:', config);
      // In a real implementation:
      // await auditService.exportAuditData(config);
      
      // Mock export functionality
      const exportData = {
        auditLogs,
        summary: auditSummary,
        exportConfig: config,
        exportTimestamp: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_export_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit data:', error);
    }
  }, [auditLogs, auditSummary]);

  // Generate mock data for export demo
  const mockSelectionState: SelectionState = useMemo(() => ({
    selectedCodes: new Set(['23', '36', '110']),
    totalFee: 156.85,
    conflicts: new Map(),
    warnings: []
  }), []);

  const mockRecommendations: EnhancedCodeRecommendation[] = useMemo(() => [
    {
      code: '23',
      description: 'Level A consultation',
      schedule_fee: 45.75,
      confidence: 0.95,
      category: 'Consultation',
      mbsCategory: 'consultation' as any,
      reasoning: 'Standard consultation based on consultation notes'
    },
    {
      code: '36',
      description: 'Level B consultation',
      schedule_fee: 78.20,
      confidence: 0.88,
      category: 'Consultation',
      mbsCategory: 'consultation' as any,
      reasoning: 'Extended consultation with additional complexity'
    }
  ], []);

  const complianceReportConfig: ReportConfiguration = useMemo(() => ({
    type: 'consultation_summary',
    sections: {
      summary: true,
      codeDetails: true,
      billing: true,
      conflicts: true,
      evidence: false,
      recommendations: true
    },
    styling: {
      template: 'medical',
      headerText: 'Compliance & Audit Report',
      footerText: 'MBS Analytics System - Compliance Dashboard',
      logo: ''
    }
  }), []);

  // Initialize data loading
  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  // Set up auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadAuditData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [loadAuditData, refreshInterval]);

  return (
    <div className="audit-compliance-page" data-testid="audit-compliance-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Audit & Compliance</h1>
          <p className="page-subtitle">
            Comprehensive audit trail and compliance monitoring dashboard
          </p>
        </div>
        <div className="header-actions">
          <div className="refresh-controls">
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              className="refresh-button"
              onClick={loadAuditData}
              disabled={isLoading}
              aria-label="Refresh audit data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Compliance KPIs */}
      <section className="compliance-kpis" aria-label="Compliance Metrics">
        <h2 className="section-title">Compliance Overview</h2>
        <div className="kpi-grid">
          {complianceKPIs.map((kpi) => (
            <KPICard
              key={kpi.id}
              data={{
                id: kpi.id,
                title: kpi.title,
                value: kpi.value,
                icon: kpi.icon,
                color: kpi.color,
                description: kpi.description,
                unit: kpi.unit,
                change: {
                  value: kpi.trendValue,
                  type: kpi.trend === 'up' ? 'increase' : kpi.trend === 'down' ? 'decrease' : 'neutral',
                  period: 'this month'
                }
              }}
              className="compliance-kpi-card"
            />
          ))}
        </div>
      </section>

      {/* Audit Trail Section */}
      <section className="audit-section" aria-label="Audit Trail">
        <div className="section-header">
          <h2 className="section-title">Audit Trail</h2>
          <div className="section-controls">
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="refresh-interval-select"
              aria-label="Auto-refresh interval"
            >
              <option value={10000}>Refresh every 10s</option>
              <option value={30000}>Refresh every 30s</option>
              <option value={60000}>Refresh every 1min</option>
              <option value={300000}>Refresh every 5min</option>
            </select>
          </div>
        </div>
        
        {auditSummary && (
          <AuditTrail
            auditLogs={auditLogs}
            summary={auditSummary}
            onExport={handleAuditExport}
            isLoading={isLoading}
            maxEntries={50}
            showSummary={true}
          />
        )}
      </section>

      {/* Compliance Reports Section */}
      <section className="compliance-reports" aria-label="Compliance Reports">
        <h2 className="section-title">Compliance Reports</h2>
        <div className="reports-grid">
          <div className="report-card">
            <h3 className="report-title">Monthly Compliance Report</h3>
            <p className="report-description">
              Comprehensive monthly audit and compliance summary
            </p>
            <ExportButton
              selectionState={mockSelectionState}
              recommendations={mockRecommendations}
              consultationNote="Monthly compliance analysis and audit summary"
              context={'general_practice' as ConsultationContext}
              config={complianceReportConfig}
              variant="primary"
              size="medium"
              showFormatSelector={true}
              defaultFormat="pdf"
            />
          </div>
          
          <div className="report-card">
            <h3 className="report-title">Medicare Audit Preparation</h3>
            <p className="report-description">
              Export data formatted for Medicare audit requirements
            </p>
            <ExportButton
              selectionState={mockSelectionState}
              recommendations={mockRecommendations}
              consultationNote="Medicare audit preparation data"
              context={'specialist' as ConsultationContext}
              config={{
                ...complianceReportConfig,
                styling: {
                  ...complianceReportConfig.styling,
                  headerText: 'Medicare Audit Report',
                  template: 'professional'
                }
              }}
              variant="secondary"
              size="medium"
              showFormatSelector={false}
              defaultFormat="excel"
            />
          </div>
          
          <div className="report-card">
            <h3 className="report-title">Variance Analysis</h3>
            <p className="report-description">
              Detailed analysis of coding patterns and variances
            </p>
            <ExportButton
              selectionState={mockSelectionState}
              recommendations={mockRecommendations}
              consultationNote="Coding variance analysis report"
              context={'general_practice' as ConsultationContext}
              config={{
                type: 'billing_analysis',
                sections: {
                  summary: true,
                  codeDetails: true,
                  billing: true,
                  conflicts: false,
                  evidence: false,
                  recommendations: true
                },
                styling: {
                  template: 'detailed',
                  headerText: 'Variance Analysis Report',
                  footerText: 'MBS Analytics - Variance Analysis',
                  logo: ''
                }
              }}
              variant="outline"
              size="medium"
              showFormatSelector={true}
              defaultFormat="excel"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuditCompliance;