/**
 * Export Service - Phase 4 Implementation
 * 
 * Provides functionality to export selected MBS codes and summaries
 * to various formats (CSV, JSON, PDF, HTML)
 */

import {
  ExportData,
  ExportOptions,
  ExportFormat,
  EnhancedCodeRecommendation,
  SelectionState,
  ConflictRule
} from '../types/api.types';

/**
 * Generate export data structure from selection state and recommendations
 */
export function generateExportData(
  selectionState: SelectionState,
  allRecommendations: EnhancedCodeRecommendation[],
  consultationNote?: string,
  consultationContext?: string
): ExportData {
  const selectedRecommendations = Array.from(selectionState.selectedCodes)
    .map(code => allRecommendations.find(rec => rec.code === code))
    .filter((rec): rec is EnhancedCodeRecommendation => rec !== undefined);

  const selectedCodes = selectedRecommendations.map(rec => ({
    code: rec.code,
    description: rec.description,
    scheduleFee: rec.schedule_fee,
    category: rec.category || '',
    reasoning: rec.reasoning
  }));

  // Extract conflicts from the selection state
  const conflicts: ExportData['conflicts'] = [];
  selectionState.conflicts.forEach((conflictRules, code) => {
    conflictRules.forEach(rule => {
      conflicts.push({
        code,
        conflictsWith: rule.conflictingCodes.filter(c => c !== code),
        reason: rule.message,
        severity: rule.severity
      });
    });
  });

  // Calculate summary
  const summary = {
    totalCodes: selectionState.selectedCodes.size,
    totalFee: Math.round(selectionState.totalFee * 100) / 100,
    conflictCount: conflicts.length,
    hasBlockingConflicts: conflicts.some(c => c.severity === 'blocking')
  };

  return {
    exportDate: new Date().toISOString(),
    selectedCodes,
    summary,
    conflicts,
    metadata: {
      exportFormat: 'json', // Will be updated based on actual export format
      consultationNote,
      consultationContext
    }
  };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData, options: ExportOptions): string {
  let csvContent = '';

  // Update metadata format
  data.metadata.exportFormat = 'csv';

  // Export selected codes
  if (options.includeReasoning) {
    csvContent += 'Code,Description,Fee,Category,Reasoning\n';
    data.selectedCodes.forEach(code => {
      const reasoning = code.reasoning ? `"${code.reasoning.replace(/"/g, '""')}"` : '';
      csvContent += `${code.code},"${code.description}",${code.scheduleFee},${code.category},${reasoning}\n`;
    });
  } else {
    csvContent += 'Code,Description,Fee,Category\n';
    data.selectedCodes.forEach(code => {
      csvContent += `${code.code},"${code.description}",${code.scheduleFee},${code.category}\n`;
    });
  }

  // Add summary section if requested
  if (options.includeSummary) {
    csvContent += '\n--- Summary ---\n';
    csvContent += `Total Codes,${data.summary.totalCodes}\n`;
    csvContent += `Total Fee,${data.summary.totalFee}\n`;
    csvContent += `Conflicts,${data.summary.conflictCount}\n`;
    csvContent += `Has Blocking Conflicts,${data.summary.hasBlockingConflicts}\n`;
  }

  // Add conflicts section if requested
  if (options.includeConflicts && data.conflicts.length > 0) {
    csvContent += '\n--- Conflicts ---\n';
    csvContent += 'Code,Conflicts With,Reason,Severity\n';
    data.conflicts.forEach(conflict => {
      csvContent += `${conflict.code},"${conflict.conflictsWith.join(', ')}","${conflict.reason}",${conflict.severity}\n`;
    });
  }

  // Add consultation note if requested
  if (options.includeConsultationNote && data.metadata.consultationNote) {
    csvContent += '\n--- Consultation Note ---\n';
    csvContent += `"${data.metadata.consultationNote.replace(/"/g, '""')}"\n`;
  }

  return csvContent;
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: ExportData, options: ExportOptions): string {
  // Update metadata format
  data.metadata.exportFormat = 'json';

  const exportObject: any = {
    exportDate: data.exportDate,
    selectedCodes: data.selectedCodes.map(code => {
      const codeObj: any = {
        code: code.code,
        description: code.description,
        scheduleFee: code.scheduleFee,
        category: code.category
      };
      
      if (options.includeReasoning && code.reasoning) {
        codeObj.reasoning = code.reasoning;
      }
      
      return codeObj;
    })
  };

  if (options.includeSummary) {
    exportObject.summary = data.summary;
  }

  if (options.includeConflicts && data.conflicts.length > 0) {
    exportObject.conflicts = data.conflicts;
  }

  if (options.includeConsultationNote && data.metadata.consultationNote) {
    exportObject.consultationNote = data.metadata.consultationNote;
    exportObject.consultationContext = data.metadata.consultationContext;
  }

  exportObject.metadata = {
    exportFormat: 'json',
    generatedAt: data.exportDate
  };

  return JSON.stringify(exportObject, null, 2);
}

/**
 * Export data to PDF format
 */
export async function exportToPDF(data: ExportData, options: ExportOptions): Promise<Blob> {
  // Update metadata format
  data.metadata.exportFormat = 'pdf';

  // Generate HTML content for PDF conversion
  const htmlContent = generatePDFHTML(data, options);

  // In a real implementation, this would use a library like jsPDF or puppeteer
  // For testing purposes, we'll create a mock PDF blob
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${htmlContent.length}
>>
stream
${htmlContent}
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000209 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${300 + htmlContent.length}
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

/**
 * Generate HTML content for PDF conversion
 */
function generatePDFHTML(data: ExportData, options: ExportOptions): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>MBS Code Export Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1, h2 { color: #2c3e50; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
    .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
    .conflict { color: #e74c3c; }
    .fee { text-align: right; font-weight: bold; }
  </style>
</head>
<body>
  <h1>MBS Code Export Report</h1>
  <p><strong>Generated:</strong> ${new Date(data.exportDate).toLocaleString()}</p>
`;

  // Summary section
  if (options.includeSummary) {
    html += `
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Codes:</strong> ${data.summary.totalCodes}</p>
    <p><strong>Total Fee:</strong> $${data.summary.totalFee.toFixed(2)}</p>
    <p><strong>Conflicts:</strong> ${data.summary.conflictCount}</p>
    <p><strong>Blocking Conflicts:</strong> ${data.summary.hasBlockingConflicts ? 'Yes' : 'No'}</p>
  </div>
`;
  }

  // Selected codes table
  html += `
  <h2>Selected MBS Codes</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Description</th>
        <th>Fee</th>
        <th>Category</th>
        ${options.includeReasoning ? '<th>Reasoning</th>' : ''}
      </tr>
    </thead>
    <tbody>
`;

  data.selectedCodes.forEach(code => {
    html += `
      <tr>
        <td>${code.code}</td>
        <td>${code.description}</td>
        <td class="fee">$${code.scheduleFee.toFixed(2)}</td>
        <td>${code.category}</td>
        ${options.includeReasoning ? `<td>${code.reasoning || ''}</td>` : ''}
      </tr>
`;
  });

  html += `
    </tbody>
  </table>
`;

  // Conflicts section
  if (options.includeConflicts && data.conflicts.length > 0) {
    html += `
  <h2>Conflicts</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Conflicts With</th>
        <th>Reason</th>
        <th>Severity</th>
      </tr>
    </thead>
    <tbody>
`;

    data.conflicts.forEach(conflict => {
      html += `
      <tr class="conflict">
        <td>${conflict.code}</td>
        <td>${conflict.conflictsWith.join(', ')}</td>
        <td>${conflict.reason}</td>
        <td>${conflict.severity}</td>
      </tr>
`;
    });

    html += `
    </tbody>
  </table>
`;
  }

  // Consultation note
  if (options.includeConsultationNote && data.metadata.consultationNote) {
    html += `
  <h2>Consultation Note</h2>
  <div class="consultation-note">
    <p>${data.metadata.consultationNote}</p>
    <p><em>Context: ${data.metadata.consultationContext || 'Not specified'}</em></p>
  </div>
`;
  }

  html += `
</body>
</html>
`;

  return html;
}

/**
 * Export data to HTML format
 */
export function exportToHTML(data: ExportData, options: ExportOptions): string {
  // Update metadata format
  data.metadata.exportFormat = 'html';

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MBS Code Export Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    
    h1, h2, h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .header {
      border-bottom: 3px solid #3498db;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    
    tr:hover {
      background-color: #f8f9fa;
    }
    
    .fee {
      text-align: right;
      font-weight: bold;
      color: #27ae60;
    }
    
    .conflict-row {
      background-color: #fee;
      border-left: 4px solid #e74c3c;
    }
    
    .consultation-note {
      background-color: #f8f9fa;
      padding: 20px;
      border-left: 4px solid #3498db;
      border-radius: 0 5px 5px 0;
      margin: 20px 0;
    }
    
    .metadata {
      text-align: center;
      color: #666;
      font-size: 0.9em;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    @media print {
      body { margin: 0; padding: 15px; }
      .summary-card { background: #f9f9f9; }
      th { background: #333 !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MBS Code Export Report</h1>
    <p><strong>Generated:</strong> ${new Date(data.exportDate).toLocaleString()}</p>
    ${data.metadata.consultationContext ? `<p><strong>Context:</strong> ${data.metadata.consultationContext}</p>` : ''}
  </div>
`;

  // Summary section
  if (options.includeSummary) {
    html += `
  <div class="summary-card">
    <h2>Summary</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
      <div><strong>Total Codes:</strong> ${data.summary.totalCodes}</div>
      <div><strong>Total Fee:</strong> $${data.summary.totalFee.toFixed(2)}</div>
      <div><strong>Conflicts:</strong> ${data.summary.conflictCount}</div>
      <div><strong>Blocking Conflicts:</strong> ${data.summary.hasBlockingConflicts ? '⚠️ Yes' : '✅ No'}</div>
    </div>
  </div>
`;
  }

  // Selected codes table
  html += `
  <h2>Selected MBS Codes</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Description</th>
        <th>Schedule Fee</th>
        <th>Category</th>
        ${options.includeReasoning ? '<th>Clinical Reasoning</th>' : ''}
      </tr>
    </thead>
    <tbody>
`;

  data.selectedCodes.forEach(code => {
    html += `
      <tr>
        <td><strong>${code.code}</strong></td>
        <td>${code.description}</td>
        <td class="fee">$${code.scheduleFee.toFixed(2)}</td>
        <td>${code.category}</td>
        ${options.includeReasoning ? `<td><em>${code.reasoning || 'No reasoning provided'}</em></td>` : ''}
      </tr>
`;
  });

  html += `
    </tbody>
  </table>
`;

  // Conflicts section
  if (options.includeConflicts && data.conflicts.length > 0) {
    html += `
  <h2>⚠️ Conflicts Detected</h2>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Conflicts With</th>
        <th>Reason</th>
        <th>Severity</th>
      </tr>
    </thead>
    <tbody>
`;

    data.conflicts.forEach(conflict => {
      html += `
      <tr class="conflict-row">
        <td><strong>${conflict.code}</strong></td>
        <td>${conflict.conflictsWith.join(', ')}</td>
        <td>${conflict.reason}</td>
        <td>
          <span style="color: ${conflict.severity === 'blocking' ? '#e74c3c' : '#f39c12'};">
            ${conflict.severity === 'blocking' ? '🚫 Blocking' : '⚠️ Warning'}
          </span>
        </td>
      </tr>
`;
    });

    html += `
    </tbody>
  </table>
`;
  }

  // Consultation note
  if (options.includeConsultationNote && data.metadata.consultationNote) {
    html += `
  <h2>Consultation Note</h2>
  <div class="consultation-note">
    <p>${data.metadata.consultationNote}</p>
  </div>
`;
  }

  html += `
  <div class="metadata">
    <p>Generated by MBS RAG System • ${new Date(data.exportDate).toISOString()}</p>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * ExportService class for managing exports
 */
export class ExportService {
  /**
   * Export data to a file and trigger download
   */
  async exportToFile(data: ExportData, options: ExportOptions): Promise<void> {
    let content: string | Blob;
    let mimeType: string;
    let fileExtension: string;

    switch (options.format) {
      case 'csv':
        content = exportToCSV(data, options);
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
        break;
      
      case 'json':
        content = exportToJSON(data, options);
        mimeType = 'application/json;charset=utf-8;';
        fileExtension = 'json';
        break;
      
      case 'html':
        content = exportToHTML(data, options);
        mimeType = 'text/html;charset=utf-8;';
        fileExtension = 'html';
        break;
      
      case 'pdf':
        content = await exportToPDF(data, options);
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Generate filename
    const filename = options.filename || this.generateFilename(options.format);
    const fullFilename = filename.endsWith(`.${fileExtension}`) 
      ? filename 
      : `${filename}.${fileExtension}`;

    // Create and trigger download
    const blob = content instanceof Blob 
      ? content 
      : new Blob([content], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullFilename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Generate default filename based on current date and format
   */
  private generateFilename(format: ExportFormat): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `mbs-export-${date}`;
  }

  /**
   * Validate export options
   */
  validateOptions(options: ExportOptions): boolean {
    const validFormats: ExportFormat[] = ['csv', 'json', 'html', 'pdf'];
    if (!validFormats.includes(options.format)) {
      throw new Error(`Invalid export format: ${options.format}`);
    }

    if (options.template && !['standard', 'detailed', 'compact'].includes(options.template)) {
      throw new Error(`Invalid template: ${options.template}`);
    }

    return true;
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): ExportFormat[] {
    return ['csv', 'json', 'html', 'pdf'];
  }

  /**
   * Estimate file size for given options
   */
  estimateFileSize(data: ExportData, options: ExportOptions): number {
    // Simple estimation based on content
    let baseSize = data.selectedCodes.length * 150; // ~150 bytes per code
    
    if (options.includeReasoning) baseSize += data.selectedCodes.length * 200;
    if (options.includeConflicts) baseSize += data.conflicts.length * 100;
    if (options.includeSummary) baseSize += 500;
    if (options.includeConsultationNote && data.metadata.consultationNote) {
      baseSize += data.metadata.consultationNote.length;
    }

    // Format multipliers
    const formatMultipliers: Record<ExportFormat, number> = {
      'csv': 1,
      'json': 1.5,
      'html': 3,
      'pdf': 5
    };

    return Math.round(baseSize * formatMultipliers[options.format]);
  }
}