/**
 * Export Button Component
 * 
 * Provides easy-to-use export functionality for reports in multiple formats.
 * Supports PDF, Excel, and HTML export with progress indicators and error handling.
 */

import React, { useState } from 'react';
import { ReportingService } from '../../services/reportingService';
import { 
  SelectionState, 
  EnhancedCodeRecommendation, 
  ConsultationContext, 
  ReportConfiguration 
} from '../../types/api.types';
import './ExportButton.css';

export interface ExportButtonProps {
  /** Selection state for the report */
  selectionState: SelectionState;
  /** Code recommendations for the report */
  recommendations: EnhancedCodeRecommendation[];
  /** Consultation note text */
  consultationNote: string;
  /** Consultation context */
  context: ConsultationContext;
  /** Report configuration */
  config: ReportConfiguration;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Additional CSS classes */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Show format dropdown */
  showFormatSelector?: boolean;
  /** Default export format */
  defaultFormat?: 'html' | 'pdf' | 'excel';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  selectionState,
  recommendations,
  consultationNote,
  context,
  config,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  showFormatSelector = true,
  defaultFormat = 'pdf'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat] = useState<'html' | 'pdf' | 'excel'>(defaultFormat);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const reportingService = new ReportingService();

  const handleExport = async (format?: 'html' | 'pdf' | 'excel') => {
    const selectedFormat = format || exportFormat;
    
    try {
      setIsExporting(true);
      setError(null);

      // Generate the report
      const reportBlob = await reportingService.generateReport(
        selectionState,
        recommendations,
        consultationNote,
        context,
        config,
        selectedFormat
      );

      // Download the file
      await reportingService.downloadReport(
        reportBlob as Blob,
        config.styling.headerText || 'MBS Report',
        selectedFormat
      );

    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'html': return '🌐';
      default: return '📁';
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf': return 'PDF Document';
      case 'excel': return 'Excel Spreadsheet';
      case 'html': return 'HTML Report';
      default: return format.toUpperCase();
    }
  };

  const estimatedTime = reportingService.estimateGenerationTime(
    selectionState,
    recommendations,
    config,
    exportFormat
  );

  if (showFormatSelector) {
    return (
      <div className={`export-button-container ${className}`}>
        <div className="export-dropdown">
          <button
            className={`export-button export-button--${variant} export-button--${size}`}
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled || isExporting}
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            {isExporting ? (
              <>
                <span className="export-spinner"></span>
                Exporting...
              </>
            ) : (
              <>
                <span className="export-icon">📥</span>
                Export Report
                <span className="dropdown-arrow">▼</span>
              </>
            )}
          </button>

          {showDropdown && !isExporting && (
            <div className="export-dropdown-menu" role="menu">
              {(['pdf', 'excel', 'html'] as const).map((format) => (
                <button
                  key={format}
                  className="export-dropdown-item"
                  onClick={() => handleExport(format)}
                  role="menuitem"
                >
                  <span className="format-icon">{getFormatIcon(format)}</span>
                  <div className="format-details">
                    <span className="format-name">{getFormatLabel(format)}</span>
                    <span className="format-description">
                      {format === 'pdf' && 'Professional document for printing'}
                      {format === 'excel' && 'Spreadsheet with data tables'}
                      {format === 'html' && 'Web page for sharing'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="export-error" role="alert">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isExporting && (
          <div className="export-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-text">
              Generating {getFormatLabel(exportFormat).toLowerCase()}...
              <br />
              <small>Estimated time: {Math.ceil(estimatedTime / 1000)}s</small>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Simple button without format selector
  return (
    <div className={`export-button-container ${className}`}>
      <button
        className={`export-button export-button--${variant} export-button--${size}`}
        onClick={() => handleExport()}
        disabled={disabled || isExporting}
      >
        {isExporting ? (
          <>
            <span className="export-spinner"></span>
            Exporting...
          </>
        ) : (
          <>
            <span className="export-icon">{getFormatIcon(exportFormat)}</span>
            Export as {getFormatLabel(exportFormat)}
          </>
        )}
      </button>

      {error && (
        <div className="export-error" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">
            Generating {getFormatLabel(exportFormat).toLowerCase()}...
          </span>
        </div>
      )}
    </div>
  );
};

export default ExportButton;