/**
 * Virtualized Table Component
 * 
 * High-performance table component that uses virtual scrolling to handle
 * large datasets efficiently. Includes sorting, filtering, and selection.
 */

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { useOptimizedList, usePerformanceMonitor } from '../../hooks/usePerformance';
import { useTableAccessibility } from '../../hooks/useAccessibility';
import './VirtualizedTable.css';

// ============================================================================
// Types
// ============================================================================

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowHeight?: number;
  containerHeight?: number;
  enableVirtualization?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selectedRows: Set<number>) => void;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  overscan?: number;
  stickyHeader?: boolean;
  zebra?: boolean;
  density?: 'compact' | 'normal' | 'spacious';
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

// ============================================================================
// Main Component
// ============================================================================

function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  containerHeight = 400,
  enableVirtualization = true,
  enableSorting = true,
  enableFiltering = true,
  enableSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  onRowClick,
  className = '',
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  isLoading = false,
  overscan = 5,
  stickyHeader = true,
  zebra = true,
  density = 'normal'
}: VirtualizedTableProps<T>) {
  
  // Performance monitoring
  usePerformanceMonitor('VirtualizedTable');

  // State management
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Accessibility
  const {
    containerRef,
    tableId,
    captionId,
    announceTableInfo,
    announceRowSelection,
    handleCellNavigation
  } = useTableAccessibility(data, columns.map(col => String(col.key)));

  // Calculate row height based on density
  const actualRowHeight = useMemo(() => {
    const densityMultipliers = { compact: 0.8, normal: 1, spacious: 1.3 };
    return Math.round(rowHeight * densityMultipliers[density]);
  }, [rowHeight, density]);

  // Sort function
  const sortFn = useCallback((a: T, b: T): number => {
    if (!sortState.column) return 0;
    
    const aVal = a[sortState.column];
    const bVal = b[sortState.column];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal < bVal ? -1 : 1;
    return sortState.direction === 'desc' ? -comparison : comparison;
  }, [sortState]);

  // Filter function
  const filterFn = useCallback((item: T): boolean => {
    // Global search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable = columns
        .filter(col => col.filterable !== false)
        .some(col => {
          const value = item[col.key];
          return value && String(value).toLowerCase().includes(query);
        });
      if (!searchable) return false;
    }

    // Column-specific filters
    return Object.entries(filters).every(([columnKey, filterValue]) => {
      if (!filterValue) return true;
      const itemValue = item[columnKey];
      return itemValue && String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
    });
  }, [searchQuery, filters, columns]);

  // Use optimized list hook
  const {
    items: visibleItems,
    totalItems,
    totalHeight,
    offsetY,
    startIndex,
    handleScroll
  } = useOptimizedList({
    items: data,
    itemHeight: actualRowHeight,
    containerHeight,
    searchQuery,
    searchFields: columns
      .filter(col => col.filterable !== false)
      .map(col => col.key),
    filterFn,
    sortFn,
    enableVirtualization,
    overscan
  });

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!enableSorting) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    setSortState(prev => {
      if (prev.column === columnKey) {
        const newDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
        return { column: newDirection ? columnKey : null, direction: newDirection };
      }
      return { column: columnKey, direction: 'asc' };
    });
  }, [enableSorting, columns]);

  // Handle selection
  const handleRowSelection = useCallback((index: number, selected: boolean) => {
    if (!enableSelection || !onSelectionChange) return;
    
    const actualIndex = startIndex + index;
    const newSelection = new Set(selectedRows);
    
    if (selected) {
      newSelection.add(actualIndex);
    } else {
      newSelection.delete(actualIndex);
    }
    
    onSelectionChange(newSelection);
    announceRowSelection(actualIndex, selected);
  }, [enableSelection, onSelectionChange, selectedRows, startIndex, announceRowSelection]);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!enableSelection || !onSelectionChange) return;
    
    const newSelection = selected 
      ? new Set(Array.from({ length: totalItems }, (_, i) => i))
      : new Set<number>();
    
    onSelectionChange(newSelection);
  }, [enableSelection, onSelectionChange, totalItems]);

  // Handle column filter
  const handleColumnFilter = useCallback((columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  }, []);

  // Announce table changes
  useEffect(() => {
    announceTableInfo();
  }, [totalItems, announceTableInfo]);

  // Render table header
  const renderHeader = () => {
    const allSelected = selectedRows.size === totalItems && totalItems > 0;
    const indeterminate = selectedRows.size > 0 && selectedRows.size < totalItems;

    return (
      <thead ref={headerRef} className={stickyHeader ? 'sticky-header' : ''}>
        <tr>
          {enableSelection && (
            <th className="selection-column">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = indeterminate;
                }}
                onChange={e => handleSelectAll(e.target.checked)}
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map(column => (
            <th
              key={String(column.key)}
              className={`${column.className || ''} ${
                column.sortable && enableSorting ? 'sortable' : ''
              }`}
              style={{
                width: column.width,
                minWidth: column.minWidth
              }}
              onClick={() => enableSorting && column.sortable && handleSort(String(column.key))}
              aria-sort={
                sortState.column === column.key
                  ? sortState.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'
              }
            >
              <div className="header-content">
                <span className="header-title">{column.title}</span>
                {enableSorting && column.sortable && (
                  <span className="sort-indicator">
                    {sortState.column === column.key && sortState.direction === 'asc' && '↑'}
                    {sortState.column === column.key && sortState.direction === 'desc' && '↓'}
                    {sortState.column !== column.key && '↕'}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
        
        {enableFiltering && (
          <tr className="filter-row">
            {enableSelection && <th className="selection-column"></th>}
            {columns.map(column => (
              <th key={`filter-${String(column.key)}`}>
                {column.filterable !== false && (
                  <input
                    type="text"
                    className="column-filter"
                    placeholder={`Filter ${column.title}...`}
                    value={filters[String(column.key)] || ''}
                    onChange={e => handleColumnFilter(String(column.key), e.target.value)}
                    aria-label={`Filter ${column.title}`}
                  />
                )}
              </th>
            ))}
          </tr>
        )}
      </thead>
    );
  };

  // Render table row
  const renderRow = (item: T, index: number) => {
    const actualIndex = startIndex + index;
    const isSelected = selectedRows.has(actualIndex);

    return (
      <tr
        key={actualIndex}
        className={`
          ${zebra && actualIndex % 2 === 1 ? 'zebra' : ''}
          ${isSelected ? 'selected' : ''}
          ${onRowClick ? 'clickable' : ''}
        `}
        onClick={() => onRowClick?.(item, actualIndex)}
        aria-selected={isSelected}
      >
        {enableSelection && (
          <td className="selection-column">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => {
                e.stopPropagation();
                handleRowSelection(index, e.target.checked);
              }}
              aria-label={`Select row ${actualIndex + 1}`}
            />
          </td>
        )}
        {columns.map(column => (
          <td
            key={String(column.key)}
            className={column.className || ''}
            tabIndex={0}
            onKeyDown={(e) => {
              const cells = Array.from(
                (e.target as HTMLElement).closest('tr')?.querySelectorAll('td[tabindex]') || []
              ) as HTMLElement[];
              const currentIndex = cells.indexOf(e.target as HTMLElement);
              const rowIndex = actualIndex;
              
              handleCellNavigation(e as any, rowIndex, currentIndex, (row, col) => {
                // Focus navigation logic would go here
                console.log(`Navigate to row ${row}, col ${col}`);
              });
            }}
          >
            {column.render
              ? column.render(item[column.key], item, actualIndex)
              : String(item[column.key] || '')
            }
          </td>
        ))}
      </tr>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`virtualized-table-container loading ${className}`}>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && visibleItems.length === 0) {
    return (
      <div className={`virtualized-table-container empty ${className}`}>
        <div className="empty-state">
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef as any}
      className={`virtualized-table-container ${className} density-${density}`}
    >
      {/* Global search */}
      {enableFiltering && (
        <div className="table-controls">
          <input
            type="text"
            className="global-search"
            placeholder="Search all columns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search table data"
          />
          <div className="table-info">
            Showing {visibleItems.length} of {totalItems} rows
          </div>
        </div>
      )}

      {/* Virtual scrollable table */}
      <div
        ref={tableRef}
        className="table-viewport"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="region"
        aria-labelledby={captionId}
      >
        <table
          id={tableId}
          className="virtualized-table"
          role="table"
          aria-rowcount={totalItems}
        >
          <caption id={captionId} className="sr-only">
            Data table with {totalItems} rows and {columns.length} columns
          </caption>
          
          {renderHeader()}
          
          <tbody style={{ height: totalHeight }}>
            {enableVirtualization && (
              <tr style={{ height: offsetY, pointerEvents: 'none' }}>
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} />
              </tr>
            )}
            
            {visibleItems.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VirtualizedTable;