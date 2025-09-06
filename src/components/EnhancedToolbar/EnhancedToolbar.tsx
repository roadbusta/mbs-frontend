/**
 * Enhanced Toolbar Component
 * 
 * Professional toolbar component providing bulk operations, quick filters,
 * export functionality, and undo/redo controls for MBS code selection.
 * 
 * Features:
 * - Bulk selection operations (select all, clear, by category, compatible, invert)
 * - Real-time quick filters (category, fee range, confidence threshold)
 * - Multi-format export functionality (CSV, JSON, HTML, PDF)
 * - Undo/redo controls with keyboard shortcuts
 * - Professional medical-grade UI with accessibility support
 * - Responsive design for desktop and mobile
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { EnhancedCodeRecommendation, ExportFormat, BulkOperationType, QuickFilters } from '../../types/api.types';
import './EnhancedToolbar.css';

export interface EnhancedToolbarProps {
  /** Array of currently selected code strings */
  selectedCodes: string[];
  /** Array of all code recommendations with enhanced data */
  recommendations: EnhancedCodeRecommendation[];
  /** Callback for bulk operation actions */
  onBulkOperation: (operation: BulkOperationType, data?: string) => void;
  /** Callback for filter changes */
  onFilterChange: (filters: QuickFilters) => void;
  /** Callback for export actions */
  onExport: (format: ExportFormat) => void;
  /** Callback for undo action */
  onUndo: () => void;
  /** Callback for redo action */
  onRedo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Total fee of selected codes */
  totalSelectedFee: number;
  /** Number of conflicts in current selection */
  conflictCount: number;
  /** Whether operations are currently loading */
  isLoading?: boolean;
}

const EnhancedToolbar: React.FC<EnhancedToolbarProps> = React.memo(({
  selectedCodes = [],
  recommendations = [],
  onBulkOperation,
  onFilterChange,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  totalSelectedFee = 0,
  conflictCount,
  isLoading = false
}) => {
  // Internal state for filters
  const [filters, setFilters] = useState<QuickFilters>({
    category: '',
    minFee: 0,
    maxFee: 1000,
    minConfidence: 0.6
  });

  // State for UI controls
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [feeValidationError, setFeeValidationError] = useState('');
  const [filtersActive, setFiltersActive] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Memoized values for performance
  const uniqueCategories = useMemo(() => {
    const categories = [
      ...new Set(
        recommendations
          .map(rec => rec.mbsCategory)
          .filter((c): c is EnhancedCodeRecommendation['mbsCategory'] => Boolean(c))
      )
    ].sort();
    return categories;
  }, [recommendations]);

  const selectionSummary = useMemo(() => {
    const selectedCount = selectedCodes?.length || 0;
    const totalCodes = recommendations?.length || 0;
    const formattedFee = (totalSelectedFee || 0).toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    });
    const safeConflictCount = conflictCount || 0;
    
    return {
      selectedCount,
      totalCodes,
      formattedFee,
      conflictText: safeConflictCount === 1 ? '1 conflict' : `${safeConflictCount} conflicts`
    };
  }, [selectedCodes?.length, recommendations?.length, totalSelectedFee, conflictCount]);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    debounce((newFilters: QuickFilters) => {
      onFilterChange(newFilters);
    }, 300),
    [onFilterChange]
  );

  // Handle filter changes with validation
  const handleFilterChange = useCallback((field: keyof QuickFilters, value: string | number) => {
    const newFilters = { ...filters, [field]: value };
    
    // Validate fee range
    if (field === 'minFee' || field === 'maxFee') {
      const minFee = field === 'minFee' ? Number(value) : filters.minFee;
      const maxFee = field === 'maxFee' ? Number(value) : filters.maxFee;
      
      if (minFee < 0) {
        newFilters[field] = 0;
      } else if (minFee > maxFee) {
        setFeeValidationError('Minimum fee cannot be greater than maximum fee');
        return;
      } else {
        setFeeValidationError('');
      }
    }
    
    setFilters(newFilters);
    setFiltersActive(
      (newFilters.category ?? '') !== '' ||
      newFilters.minFee > 0 ||
      newFilters.maxFee < 1000 ||
      newFilters.minConfidence > 0.6
    );
    
    debouncedFilterChange(newFilters);
  }, [filters, debouncedFilterChange]);

  // Bulk operation handlers with debouncing
  const handleBulkOperation = useCallback(
    debounce((operation: BulkOperationType, data?: string) => {
      if (isLoading) return;
      onBulkOperation(operation, data);
    }, 100),
    [onBulkOperation, isLoading]
  );

  // Category selection handler
  const handleCategorySelect = useCallback((category: string) => {
    handleBulkOperation('select_by_category', category);
    setCategoryDropdownOpen(false);
  }, [handleBulkOperation]);

  // Export handler
  const handleExport = useCallback(() => {
    if (selectedCodes.length === 0 || isLoading) return;
    onExport(exportFormat);
  }, [selectedCodes.length, exportFormat, onExport, isLoading]);

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    const defaultFilters = {
      category: '',
      minFee: 0,
      maxFee: 1000,
      minConfidence: 0.6
    };
    
    setFilters(defaultFilters);
    setFiltersActive(false);
    setFeeValidationError('');
    onFilterChange(defaultFilters);
  }, [onFilterChange]);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isLoading) return;
    
    const { key, ctrlKey, metaKey } = event;
    const isModPressed = ctrlKey || metaKey;
    
    switch (true) {
      case isModPressed && key === 'a':
        event.preventDefault();
        handleBulkOperation('select_all');
        break;
      case isModPressed && key === 'z':
        event.preventDefault();
        if (canUndo) onUndo();
        break;
      case isModPressed && key === 'y':
        event.preventDefault();
        if (canRedo) onRedo();
        break;
      case key === 'Delete':
        event.preventDefault();
        handleBulkOperation('clear_all');
        break;
      case key === 'Escape':
        if (categoryDropdownOpen) {
          setCategoryDropdownOpen(false);
        }
        break;
    }
  }, [handleBulkOperation, onUndo, onRedo, canUndo, canRedo, isLoading, categoryDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.category-dropdown')) {
          setCategoryDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDropdownOpen]);

  return (
    <div 
      className="enhanced-toolbar"
      aria-label="Enhanced Toolbar"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* First Row: Selection Summary + Quick Actions */}
      <div className="toolbar-row">
        {/* Selection Summary */}
        <div className="selection-summary" aria-label="Selection Summary">
          <div className="summary-stat">
            <span className="stat-value">{selectionSummary.selectedCount}</span>
            <span className="stat-label">selected</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-stat">
            <span className="stat-value">{selectionSummary.formattedFee}</span>
            <span className="stat-label">total fee</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-stat">
            <span className={`stat-value ${conflictCount > 0 ? 'has-conflicts' : ''}`}>
              {conflictCount || 0}
            </span>
            <span className="stat-label">conflicts</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-stat">
            <span className="stat-value">{selectionSummary.totalCodes}</span>
            <span className="stat-label">total codes</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="toolbar-section" aria-label="Bulk Operations">
          <button
            type="button"
            className="toolbar-button primary"
            onClick={() => handleBulkOperation('select_all')}
            disabled={isLoading}
            title="Select All (Ctrl+A)"
          >
            <span className="button-icon">☑️</span>
            <span className="button-text">Select All</span>
            <span className="keyboard-shortcut">Ctrl+A</span>
          </button>
          
          <button
            type="button"
            className="toolbar-button secondary"
            onClick={() => handleBulkOperation('clear_all')}
            disabled={isLoading}
            title="Clear All (Delete)"
          >
            <span className="button-icon">🗑️</span>
            <span className="button-text">Clear All</span>
            <span className="keyboard-shortcut">Del</span>
          </button>

          <div className="category-dropdown">
            <button
              type="button"
              className="toolbar-button secondary"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              disabled={isLoading}
              aria-expanded={categoryDropdownOpen}
            >
              <span className="button-icon">📂</span>
              <span className="button-text">Category</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {categoryDropdownOpen && (
              <div className="dropdown-menu" role="menu">
                {uniqueCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleCategorySelect(category)}
                    role="menuitem"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export & History */}
        <div className="toolbar-section" aria-label="Export Options">
          <div className="export-controls">
            <div className="export-group">
              <select
                className="filter-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                title="Export Format"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <button
              type="button"
              className="toolbar-button primary"
              onClick={handleExport}
              disabled={selectedCodes.length === 0 || isLoading}
              title="Export Selected Codes"
            >
              <span className="button-icon">💾</span>
              <span className="button-text">Export</span>
            </button>
          </div>

          <button
            type="button"
            className="toolbar-button secondary"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            title="Undo (Ctrl+Z)"
          >
            <span className="button-icon">↶</span>
            <span className="button-text">Undo</span>
            <span className="keyboard-shortcut">Ctrl+Z</span>
          </button>

          <button
            type="button"
            className="toolbar-button secondary"
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            title="Redo (Ctrl+Y)"
          >
            <span className="button-icon">↷</span>
            <span className="button-text">Redo</span>
            <span className="keyboard-shortcut">Ctrl+Y</span>
          </button>
        </div>
      </div>

      {/* Second Row: Filters (collapsible) */}
      {showMoreFilters && (
        <div className="toolbar-row">
          <div className="toolbar-section" aria-label="Quick Filters">
            <span className="section-title">Filters:</span>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category-filter" className="filter-label">Category</label>
              <select
                id="category-filter"
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="min-fee-filter" className="filter-label">Min Fee</label>
              <input
                id="min-fee-filter"
                type="number"
                className="filter-input"
                value={filters.minFee}
                onChange={(e) => handleFilterChange('minFee', Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="$0"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="max-fee-filter" className="filter-label">Max Fee</label>
              <input
                id="max-fee-filter"
                type="number"
                className="filter-input"
                value={filters.maxFee}
                onChange={(e) => handleFilterChange('maxFee', Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="$1000"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="confidence-filter" className="filter-label">
                Confidence ({Math.round(filters.minConfidence * 100)}%)
              </label>
              <input
                id="confidence-filter"
                type="range"
                className="filter-slider"
                value={filters.minConfidence}
                onChange={(e) => handleFilterChange('minConfidence', Number(e.target.value))}
                min="0"
                max="1"
                step="0.05"
              />
            </div>
          </div>

          <div className="toolbar-section">
            <button
              type="button"
              className="reset-button"
              onClick={handleResetFilters}
              disabled={!filtersActive}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="toolbar-row" style={{ justifyContent: 'center', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
        <button
          type="button"
          className="reset-button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          {showMoreFilters ? '▲ Hide Filters' : '▼ Show Filters'}
          {filtersActive && <span style={{ marginLeft: '8px', color: '#3b82f6', fontWeight: '600' }}>●</span>}
        </button>
      </div>

      {feeValidationError && (
        <div className="validation-error" role="alert">
          {feeValidationError}
        </div>
      )}
    </div>
  );
});

EnhancedToolbar.displayName = 'EnhancedToolbar';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default EnhancedToolbar;