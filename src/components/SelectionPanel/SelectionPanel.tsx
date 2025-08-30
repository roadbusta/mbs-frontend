/**
 * Selection Management Panel Component
 * 
 * Professional selection management interface for MBS code selections.
 * Provides selection summary, preset management, optimization suggestions, and selection comparison.
 * 
 * Features:
 * - Selection summary with statistics
 * - Preset save/load/delete functionality
 * - Optimization suggestions with apply actions
 * - Selection history with revert capability
 * - Selection comparison mode
 * - Accessibility-first design
 * - Responsive mobile-first layout
 */

import React, { useState, useEffect } from 'react';
import { SelectionState, SelectionPreset, OptimizationSuggestion, SelectionHistoryEntry, AuditLogEntry, AuditTrailSummary } from '../../types/api.types';
import AuditTrail from '../AuditTrail/AuditTrail';
import auditService from '../../services/auditService';
import './SelectionPanel.css';

interface SelectionPanelProps {
  /** Current selection state */
  selectionState: SelectionState;
  /** Available selection presets */
  presets: SelectionPreset[];
  /** Available optimization suggestions */
  optimizationSuggestions: OptimizationSuggestion[];
  /** Selection history entries */
  selectionHistory: SelectionHistoryEntry[];
  /** Handler for saving new presets */
  onPresetSave: (preset: { name: string; description?: string }) => void;
  /** Handler for loading a preset */
  onPresetLoad: (presetId: string) => void;
  /** Handler for deleting a preset */
  onPresetDelete: (presetId: string) => void;
  /** Handler for applying optimization suggestions */
  onOptimizationApply: (suggestion: OptimizationSuggestion) => void;
  /** Handler for reverting to historical selection */
  onSelectionRevert: (historyId: string) => void;
  /** Handler for starting comparison mode */
  onComparisonStart: () => void;
  /** Whether comparison mode is active */
  isComparisonMode?: boolean;
  /** Current comparison selection state */
  comparisonSelection?: SelectionState | null;
  /** Whether the panel is in loading state */
  isLoading?: boolean;
  /** Whether to show audit trail section */
  showAuditTrail?: boolean;
}

/**
 * Selection Management Panel Component
 */
const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectionState,
  presets,
  optimizationSuggestions,
  selectionHistory,
  onPresetSave,
  onPresetLoad,
  onPresetDelete,
  onOptimizationApply,
  onSelectionRevert,
  onComparisonStart,
  isComparisonMode = false,
  comparisonSelection = null,
  isLoading = false,
  showAuditTrail = true,
}) => {
  // Local state for preset creation
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  
  // Audit trail state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditTrailSummary | null>(null);
  const [showAuditSection, setShowAuditSection] = useState(showAuditTrail);

  // Subscribe to audit service updates
  useEffect(() => {
    if (!showAuditTrail) return;
    
    const updateAuditData = () => {
      setAuditLogs(auditService.getLogs());
      setAuditSummary(auditService.generateSummary());
    };

    // Initial load
    updateAuditData();

    // Subscribe to updates
    const unsubscribe = auditService.subscribe(updateAuditData);

    return unsubscribe;
  }, [showAuditTrail]);

  /**
   * Handle audit trail export
   */
  const handleAuditExport = (config: any) => {
    try {
      const exportData = auditService.exportAuditData(config);
      const filename = `audit_trail_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${config.format}`;
      
      const blob = new Blob([exportData], {
        type: config.format === 'json' ? 'application/json' : 
             config.format === 'html' ? 'text/html' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Log the export action
      auditService.logExport(config.format, auditLogs.length, filename);
    } catch (error) {
      console.error('Failed to export audit data:', error);
    }
  };

  /**
   * Handle preset form submission
   */
  const handlePresetSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (presetName.trim()) {
      onPresetSave({
        name: presetName.trim(),
        description: presetDescription.trim() || undefined,
      });
      setPresetName('');
      setPresetDescription('');
      setShowPresetForm(false);
    }
  };

  /**
   * Format fee amount for display
   */
  const formatFee = (amount: number | undefined): string => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  /**
   * Get selection summary statistics
   */
  const getSelectionStats = () => {
    const selectedCount = selectionState?.selectedCodes?.size || 0;
    const totalFee = selectionState?.totalFee || 0;
    const hasConflicts = (selectionState?.conflicts?.length || 0) > 0;
    const hasWarnings = (selectionState?.warnings?.length || 0) > 0;
    
    return {
      selectedCount,
      totalFee,
      hasConflicts,
      hasWarnings,
    };
  };

  const stats = getSelectionStats();

  return (
    <div className="selection-panel" role="complementary" aria-label="Selection Management Panel">
      {/* Loading State */}
      {isLoading && (
        <div className="selection-panel-loading" aria-live="polite">
          <div className="loading-spinner"></div>
          <span>Loading selection data...</span>
        </div>
      )}

      {/* Panel Header */}
      <div className="selection-panel-header">
        <h2>Selection Panel</h2>
        {isComparisonMode && (
          <div className="comparison-indicator" aria-live="polite">
            <span className="comparison-icon">⚖️</span>
            <span>Comparison Mode</span>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <section className="selection-summary" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Selection Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-value">
              {stats.selectedCount === 0 ? 'No codes selected' : `${stats.selectedCount} codes selected`}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatFee(stats.totalFee)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {stats.hasConflicts ? `${selectionState?.conflicts?.length || 0} conflict${(selectionState?.conflicts?.length || 0) !== 1 ? 's' : ''}` : 'No conflicts'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {stats.hasWarnings ? `${selectionState?.warnings?.length || 0} warning${(selectionState?.warnings?.length || 0) !== 1 ? 's' : ''}` : 'No warnings'}
            </span>
          </div>
        </div>
      </section>

      {/* Preset Management */}
      <section className="preset-management" aria-labelledby="presets-heading">
        <div className="section-header">
          <h3 id="presets-heading">Saved Presets</h3>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPresetForm(!showPresetForm)}
            disabled={isLoading}
            aria-expanded={showPresetForm}
            aria-controls="preset-form"
          >
            {showPresetForm ? 'Cancel' : 'Save Preset'}
          </button>
        </div>

        {/* Preset Creation Form */}
        {showPresetForm && (
          <form 
            id="preset-form"
            className="preset-form"
            onSubmit={handlePresetSave}
            aria-labelledby="preset-form-heading"
          >
            <h4 id="preset-form-heading" className="sr-only">Create New Preset</h4>
            <div className="form-group">
              <label htmlFor="preset-name">Preset Name *</label>
              <input
                id="preset-name"
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Standard GP Visit"
                required
                aria-required="true"
              />
            </div>
            <div className="form-group">
              <label htmlFor="preset-description">Description</label>
              <textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Optional description for this preset"
                rows={2}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={!presetName.trim()}>
                Save Preset
              </button>
            </div>
          </form>
        )}

        {/* Preset List */}
        <div className="preset-list" role="list">
          {presets.length === 0 ? (
            <div className="empty-state">
              <p>No saved presets</p>
              <small>Save your first preset to get started</small>
            </div>
          ) : (
            presets.map((preset) => (
              <div key={preset.id} className="preset-item" role="listitem">
                <div className="preset-info">
                  <h4 className="preset-name">{preset.name}</h4>
                  {preset.description && (
                    <p className="preset-description">{preset.description}</p>
                  )}
                  <div className="preset-meta">
                    <span className="preset-codes">{preset.selectedCodes.length} codes</span>
                  </div>
                </div>
                <div className="preset-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onPresetLoad(preset.id)}
                    disabled={isLoading}
                    aria-label={`Load preset: ${preset.name}`}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => onPresetDelete(preset.id)}
                    disabled={isLoading}
                    aria-label={`Delete preset: ${preset.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <section className="optimization-suggestions" aria-labelledby="optimization-heading">
          <h3 id="optimization-heading">Optimization Suggestions</h3>
          <div className="suggestions-list" role="list">
            {optimizationSuggestions.map((suggestion, index) => (
              <div key={`${suggestion.type}-${index}`} className="suggestion-item" role="listitem">
                <div className="suggestion-info">
                  <h4 className="suggestion-title">
                    {suggestion.type === 'maximize_fee' ? 'Fee Maximization' : 'Conflict Minimization'}
                  </h4>
                  <p className="suggestion-description">{suggestion.description}</p>
                  <div className="suggestion-impact">
                    <span className="impact-label">Potential Impact:</span>
                    <span className="impact-value">+{formatFee(suggestion.potentialImprovement)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onOptimizationApply(suggestion)}
                  disabled={isLoading}
                  aria-label={`Apply ${suggestion.type} suggestion`}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selection History */}
      {selectionHistory.length > 0 && (
        <section className="selection-history" aria-labelledby="history-heading">
          <h3 id="history-heading">Selection History</h3>
          <div className="history-list" role="list">
            {selectionHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="history-item" role="listitem">
                <div className="history-info">
                  <div className="history-action">
                    {entry.action === 'select' ? 'Selected' : 'Deselected'} code {entry.code}
                  </div>
                  <div className="history-timestamp">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onSelectionRevert(entry.id)}
                  disabled={isLoading}
                  aria-label={`Revert to selection state from ${new Date(entry.timestamp).toLocaleTimeString()}`}
                >
                  Revert
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comparison Controls */}
      <section className="comparison-controls" aria-labelledby="comparison-heading">
        <h3 id="comparison-heading">Selection Comparison</h3>
        {!isComparisonMode ? (
          <button
            type="button"
            className="btn-secondary comparison-start"
            onClick={onComparisonStart}
            disabled={isLoading || stats.selectedCount === 0}
            aria-describedby="comparison-description"
          >
            Start Comparison
          </button>
        ) : (
          <div className="comparison-active" aria-live="polite">
            <p>Comparison mode active</p>
            {comparisonSelection && (
              <div className="comparison-summary">
                <div className="comparison-stats">
                  <div>Current: {stats.selectedCount} codes, {formatFee(stats.totalFee)}</div>
                  <div>Comparing: {comparisonSelection?.selectedCodes?.size || 0} codes, {formatFee(comparisonSelection?.totalFee)}</div>
                </div>
              </div>
            )}
          </div>
        )}
        <small id="comparison-description" className="comparison-help">
          Compare different code selections to optimize your choices
        </small>
      </section>

      {/* Audit Trail */}
      {showAuditTrail && showAuditSection && (
        <section className="audit-trail-section" aria-labelledby="audit-trail-heading">
          <div className="section-header">
            <h3 id="audit-trail-heading">Audit Trail</h3>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAuditSection(!showAuditSection)}
              aria-expanded={showAuditSection}
            >
              {showAuditSection ? 'Hide' : 'Show'} Audit
            </button>
          </div>
          
          <div className="audit-trail-container">
            <AuditTrail
              auditLogs={auditLogs}
              summary={auditSummary || {
                totalActions: 0,
                sessionDurationSeconds: 0,
                mostFrequentAction: 'session_start',
                codesAnalyzed: 0,
                selectionsCount: 0,
                deselectionsCount: 0,
                exportsCount: 0,
                sessionStartTime: new Date().toISOString(),
                lastActivityTime: new Date().toISOString()
              }}
              onExport={handleAuditExport}
              isLoading={isLoading}
              maxEntries={50}
              showSummary={true}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default SelectionPanel;