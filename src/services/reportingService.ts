/**
 * Professional Reporting Service - Phase 4 Implementation
 * 
 * Generates professional medical reports in various formats for:
 * - Consultation summaries
 * - Billing analysis
 * - Conflict analysis
 * - Code recommendations
 * 
 * Supports HTML and PDF export with professional medical formatting.
 */

import {
  ReportConfiguration,
  EnhancedCodeRecommendation,
  SelectionState,
  ConsultationContext,
  MBSCategory,
  ConflictRule,
  EvidenceSpan
} from '../types/api.types';

// ============================================================================
// Report Structure Interfaces
// ============================================================================

export interface BaseReport {
  title: string;
  sections: Record<string, any>;
  metadata: {
    reportType: string;
    generatedAt: string;
    consultationContext?: ConsultationContext;
    configuration: ReportConfiguration;
  };
  generatedAt: string;
}

export interface ConsultationReport extends BaseReport {
  sections: {
    summary?: {
      totalCodes: number;
      totalFee: number;
      consultationContext: string;
      conflictsDetected: boolean;
    };
    consultationDetails?: {
      consultationNote: string;
      timestamp: string;
      context: ConsultationContext;
    };
    selectedCodes?: Array<{
      code: string;
      description: string;
      scheduleFee: number;
      confidence: number;
      category: string;
      reasoning?: string;
    }>;
    billingInformation?: {
      subtotal: number;
      itemizedCharges: Array<{
        code: string;
        description: string;
        fee: number;
      }>;
      total: number;
    };
    conflictAnalysis?: {
      hasConflicts: boolean;
      blockingConflicts: ConflictRule[];
      warnings: string[];
      resolutionSuggestions?: string[];
    };
    evidenceSupport?: Array<{
      code: string;
      description: string;
      evidenceSpans: EvidenceSpan[];
      reasoning: string;
    }>;
  };
}

export interface BillingAnalysisReport extends BaseReport {
  sections: {
    billingBreakdown: {
      totalFee: number;
      itemCount: number;
      averageFeePerCode: number;
    };
    feeAnalysis: {
      totalFee: number;
      averageFeePerCode: number;
      highestFeeCode: string;
      lowestFeeCode: string;
    };
    categoryBreakdown: Array<{
      category: MBSCategory;
      categoryName: string;
      totalFee: number;
      codeCount: number;
      codes: string[];
    }>;
    optimizationSuggestions?: {
      potentialUpgrades: Array<{
        currentCode: string;
        suggestedCode: string;
        additionalRevenue: number;
        reasoning: string;
      }>;
      additionalCodes: Array<{
        code: string;
        description: string;
        fee: number;
        reasoning: string;
      }>;
      estimatedIncrease: number;
    };
  };
}

export interface ConflictAnalysisReport extends BaseReport {
  sections: {
    conflictSummary: {
      totalConflicts: number;
      blockingConflicts: number;
      warningConflicts: number;
      affectedCodes: string[];
    };
    detailedConflicts: Array<{
      conflictingCodes: string[];
      reason: string;
      severity: 'warning' | 'blocking';
      message: string;
      impact: string;
    }>;
    resolutionSuggestions: Array<{
      conflictingCodes: string[];
      suggestedAction: string;
      reasoning: string;
      expectedOutcome: string;
    }>;
  };
}

export interface RecommendationReport extends BaseReport {
  sections: {
    analysisOverview: {
      totalRecommendations: number;
      averageConfidence: number;
      consultationContext: ConsultationContext;
      analysisTimestamp: string;
    };
    recommendedCodes: Array<{
      code: string;
      description: string;
      confidence: number;
      scheduleFee: number;
      reasoning: string;
      category: string;
      mbsCategory: MBSCategory;
    }>;
    evidenceAnalysis: {
      totalEvidenceSpans: number;
      strongEvidence: number;
      moderateEvidence: number;
      weakEvidence: number;
      coveragePercentage: number;
    };
    confidenceAssessment: {
      averageConfidence: number;
      highConfidenceCodes: number;
      lowConfidenceCodes: number;
      recommendationQuality: 'High' | 'Medium' | 'Low';
    };
  };
}

// ============================================================================
// Report Generation Functions
// ============================================================================

/**
 * Generate comprehensive consultation summary report
 */
export function generateConsultationReport(
  selectionState: SelectionState,
  recommendations: EnhancedCodeRecommendation[],
  consultationNote: string,
  context: ConsultationContext,
  config: ReportConfiguration
): ConsultationReport {
  const timestamp = new Date().toISOString();
  const selectedRecommendations = recommendations.filter(rec => 
    selectionState.selectedCodes.has(rec.code)
  );

  const sections: ConsultationReport['sections'] = {};

  // Summary section
  if (config.sections.summary) {
    sections.summary = {
      totalCodes: selectionState.selectedCodes.size,
      totalFee: selectionState.totalFee,
      consultationContext: context,
      conflictsDetected: selectionState.conflicts.size > 0
    };
  }

  // Consultation details section
  sections.consultationDetails = {
    consultationNote,
    timestamp,
    context
  };

  // Selected codes section
  if (config.sections.codeDetails) {
    sections.selectedCodes = selectedRecommendations.map(rec => ({
      code: rec.code,
      description: rec.description,
      scheduleFee: rec.schedule_fee,
      confidence: rec.confidence,
      category: rec.category || '',
      reasoning: rec.reasoning
    }));
  }

  // Billing information section
  if (config.sections.billing) {
    const itemizedCharges = selectedRecommendations.map(rec => ({
      code: rec.code,
      description: rec.description,
      fee: rec.schedule_fee
    }));

    sections.billingInformation = {
      subtotal: selectionState.totalFee,
      itemizedCharges,
      total: selectionState.totalFee
    };
  }

  // Conflict analysis section
  if (config.sections.conflicts) {
    const allConflicts: ConflictRule[] = [];
    selectionState.conflicts.forEach(conflicts => {
      allConflicts.push(...conflicts);
    });

    sections.conflictAnalysis = {
      hasConflicts: allConflicts.length > 0,
      blockingConflicts: allConflicts.filter(c => c.severity === 'blocking'),
      warnings: selectionState.warnings,
      resolutionSuggestions: generateConflictResolutions(allConflicts)
    };
  }

  // Evidence support section
  if (config.sections.evidence) {
    sections.evidenceSupport = selectedRecommendations
      .filter(rec => rec.evidence_spans && rec.evidence_spans.length > 0)
      .map(rec => ({
        code: rec.code,
        description: rec.description,
        evidenceSpans: rec.evidence_spans || [],
        reasoning: rec.reasoning || ''
      }));
  }

  return {
    title: config.styling.headerText || 'Medical Consultation Report',
    sections,
    metadata: {
      reportType: 'consultation_summary',
      generatedAt: timestamp,
      consultationContext: context,
      configuration: config
    },
    generatedAt: timestamp
  };
}

/**
 * Generate comprehensive billing analysis report
 */
export function generateBillingAnalysisReport(
  selectionState: SelectionState,
  recommendations: EnhancedCodeRecommendation[],
  config: ReportConfiguration
): BillingAnalysisReport {
  const timestamp = new Date().toISOString();
  const selectedRecommendations = recommendations.filter(rec => 
    selectionState.selectedCodes.has(rec.code)
  );

  // Calculate fee analysis
  const fees = selectedRecommendations.map(rec => rec.schedule_fee);
  const totalFee = selectionState.totalFee;
  const averageFeePerCode = totalFee / selectionState.selectedCodes.size;
  
  const feeAnalysis = {
    totalFee,
    averageFeePerCode: Math.round(averageFeePerCode * 100) / 100,
    highestFeeCode: selectedRecommendations.reduce((highest, rec) => 
      rec.schedule_fee > (highest?.schedule_fee || 0) ? rec : highest
    ).code,
    lowestFeeCode: selectedRecommendations.reduce((lowest, rec) => 
      rec.schedule_fee < (lowest?.schedule_fee || Infinity) ? rec : lowest
    ).code
  };

  // Calculate category breakdown
  const categoryMap = new Map<MBSCategory, {
    totalFee: number;
    codes: string[];
    categoryName: string;
  }>();

  selectedRecommendations.forEach(rec => {
    if (!categoryMap.has(rec.mbsCategory)) {
      categoryMap.set(rec.mbsCategory, {
        totalFee: 0,
        codes: [],
        categoryName: formatCategoryName(rec.mbsCategory)
      });
    }
    const category = categoryMap.get(rec.mbsCategory)!;
    category.totalFee += rec.schedule_fee;
    category.codes.push(rec.code);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    categoryName: data.categoryName,
    totalFee: Math.round(data.totalFee * 100) / 100,
    codeCount: data.codes.length,
    codes: data.codes
  }));

  const sections: BillingAnalysisReport['sections'] = {
    billingBreakdown: {
      totalFee,
      itemCount: selectionState.selectedCodes.size,
      averageFeePerCode
    },
    feeAnalysis,
    categoryBreakdown
  };

  // Optimization suggestions
  if (config.sections.recommendations) {
    sections.optimizationSuggestions = {
      potentialUpgrades: [],
      additionalCodes: [],
      estimatedIncrease: 0
    };
  }

  return {
    title: 'Billing Analysis Report',
    sections,
    metadata: {
      reportType: 'billing_analysis',
      generatedAt: timestamp,
      configuration: config
    },
    generatedAt: timestamp
  };
}

/**
 * Generate conflict analysis report
 */
export function generateConflictReport(
  selectionState: SelectionState,
  recommendations: EnhancedCodeRecommendation[],
  config: ReportConfiguration
): ConflictAnalysisReport {
  const timestamp = new Date().toISOString();
  
  // Collect all conflicts
  const allConflicts: ConflictRule[] = [];
  const affectedCodes: Set<string> = new Set();

  selectionState.conflicts.forEach((conflicts, code) => {
    allConflicts.push(...conflicts);
    affectedCodes.add(code);
    conflicts.forEach(conflict => {
      conflict.conflictingCodes.forEach(conflictCode => {
        affectedCodes.add(conflictCode);
      });
    });
  });

  // Deduplicate conflicts
  const uniqueConflicts = deduplicateConflicts(allConflicts);
  
  const blockingConflicts = uniqueConflicts.filter(c => c.severity === 'blocking');
  const warningConflicts = uniqueConflicts.filter(c => c.severity === 'warning');

  const sections: ConflictAnalysisReport['sections'] = {
    conflictSummary: {
      totalConflicts: uniqueConflicts.length,
      blockingConflicts: blockingConflicts.length,
      warningConflicts: warningConflicts.length,
      affectedCodes: Array.from(affectedCodes)
    },
    detailedConflicts: uniqueConflicts.map(conflict => ({
      conflictingCodes: conflict.conflictingCodes,
      reason: conflict.reason,
      severity: conflict.severity,
      message: conflict.message,
      impact: conflict.severity === 'blocking' ? 'Prevents billing' : 'May affect scheduling'
    })),
    resolutionSuggestions: generateDetailedResolutionSuggestions(uniqueConflicts, recommendations)
  };

  return {
    title: 'Conflict Analysis Report',
    sections,
    metadata: {
      reportType: 'conflict_report',
      generatedAt: timestamp,
      configuration: config
    },
    generatedAt: timestamp
  };
}

/**
 * Generate recommendation analysis report
 */
export function generateRecommendationReport(
  recommendations: EnhancedCodeRecommendation[],
  consultationNote: string,
  context: ConsultationContext,
  config: ReportConfiguration
): RecommendationReport {
  const timestamp = new Date().toISOString();
  
  // Sort recommendations by confidence (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.confidence - a.confidence);

  // Calculate confidence assessment
  const confidences = recommendations.map(rec => rec.confidence);
  const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  const highConfidenceCodes = confidences.filter(conf => conf >= 0.8).length;
  const lowConfidenceCodes = confidences.filter(conf => conf < 0.6).length;
  
  let recommendationQuality: 'High' | 'Medium' | 'Low' = 'Medium';
  if (averageConfidence >= 0.8) recommendationQuality = 'High';
  else if (averageConfidence < 0.6) recommendationQuality = 'Low';

  // Analyze evidence
  const evidenceSpans = recommendations.flatMap(rec => rec.evidence_spans || []);
  const strongEvidence = evidenceSpans.filter(span => (span.relevance || 0) >= 0.8).length;
  const moderateEvidence = evidenceSpans.filter(span => 
    (span.relevance || 0) >= 0.6 && (span.relevance || 0) < 0.8
  ).length;
  const weakEvidence = evidenceSpans.filter(span => (span.relevance || 0) < 0.6).length;

  const sections: RecommendationReport['sections'] = {
    analysisOverview: {
      totalRecommendations: recommendations.length,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      consultationContext: context,
      analysisTimestamp: timestamp
    },
    recommendedCodes: sortedRecommendations.map(rec => ({
      code: rec.code,
      description: rec.description,
      confidence: rec.confidence,
      scheduleFee: rec.schedule_fee,
      reasoning: rec.reasoning || '',
      category: rec.category || '',
      mbsCategory: rec.mbsCategory
    })),
    evidenceAnalysis: {
      totalEvidenceSpans: evidenceSpans.length,
      strongEvidence,
      moderateEvidence,
      weakEvidence,
      coveragePercentage: Math.round((evidenceSpans.length / consultationNote.length) * 1000) / 10
    },
    confidenceAssessment: {
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      highConfidenceCodes,
      lowConfidenceCodes,
      recommendationQuality
    }
  };

  return {
    title: config.styling.headerText || 'MBS Code Recommendations',
    sections,
    metadata: {
      reportType: 'recommendation_report',
      generatedAt: timestamp,
      consultationContext: context,
      configuration: config
    },
    generatedAt: timestamp
  };
}

// ============================================================================
// ReportingService Class
// ============================================================================

export class ReportingService {
  private readonly availableTemplates = ['professional', 'medical', 'simple', 'detailed'];
  
  /**
   * Generate a report in the specified format
   */
  async generateReport(
    selectionState: SelectionState,
    recommendations: EnhancedCodeRecommendation[],
    consultationNote: string,
    context: ConsultationContext,
    config: ReportConfiguration,
    format: 'html' | 'pdf'
  ): Promise<string | Blob> {
    this.validateConfiguration(config);

    let report: BaseReport;

    // Generate the appropriate report type
    switch (config.type) {
      case 'consultation_summary':
        report = generateConsultationReport(selectionState, recommendations, consultationNote, context, config);
        break;
      case 'billing_analysis':
        report = generateBillingAnalysisReport(selectionState, recommendations, config);
        break;
      case 'conflict_report':
        report = generateConflictReport(selectionState, recommendations, config);
        break;
      case 'recommendation_report':
        report = generateRecommendationReport(recommendations, consultationNote, context, config);
        break;
      default:
        throw new Error(`Unsupported report type: ${config.type}`);
    }

    if (format === 'html') {
      return this.generateHTMLReport(report, config);
    } else {
      return this.generatePDFReport(report, config);
    }
  }

  /**
   * Validate report configuration
   */
  validateConfiguration(config: ReportConfiguration): void {
    const validTypes = ['consultation_summary', 'billing_analysis', 'conflict_report', 'recommendation_report'];
    const validTemplates = ['professional', 'medical', 'simple', 'detailed'];

    if (!validTypes.includes(config.type)) {
      throw new Error(`Invalid report configuration: unsupported type '${config.type}'`);
    }

    if (!validTemplates.includes(config.styling.template)) {
      throw new Error(`Invalid report configuration: unsupported template '${config.styling.template}'`);
    }

    if (!config.sections) {
      throw new Error('Invalid report configuration: sections configuration is required');
    }
  }

  /**
   * Get available report templates
   */
  getAvailableTemplates(): string[] {
    return [...this.availableTemplates];
  }

  /**
   * Estimate report generation time in milliseconds
   */
  estimateGenerationTime(
    selectionState: SelectionState,
    recommendations: EnhancedCodeRecommendation[],
    config: ReportConfiguration,
    format: 'html' | 'pdf'
  ): number {
    const baseTime = 500; // Base generation time
    const sectionMultiplier = Object.values(config.sections).filter(Boolean).length * 100;
    const dataMultiplier = (selectionState.selectedCodes.size + recommendations.length) * 10;
    const formatMultiplier = format === 'pdf' ? 1000 : 200;

    return baseTime + sectionMultiplier + dataMultiplier + formatMultiplier;
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: BaseReport, config: ReportConfiguration): string {
    const styles = this.getTemplateStyles(config.styling.template);
    const header = config.styling.headerText || report.title;
    const footer = config.styling.footerText || 'Generated by MBS RAG System';
    const logo = config.styling.logo || '';

    let sectionsHTML = '';

    // Generate sections based on report type
    if ('summary' in report.sections && report.sections.summary) {
      sectionsHTML += this.generateSummarySection(report.sections.summary);
    }

    if ('selectedCodes' in report.sections && report.sections.selectedCodes) {
      sectionsHTML += this.generateSelectedCodesTable(report.sections.selectedCodes);
    }

    if ('billingInformation' in report.sections && report.sections.billingInformation) {
      sectionsHTML += this.generateBillingSection(report.sections.billingInformation);
    }

    if ('categoryBreakdown' in report.sections && report.sections.categoryBreakdown) {
      sectionsHTML += this.generateCategoryBreakdownSection(report.sections.categoryBreakdown);
    }

    if ('conflictAnalysis' in report.sections && report.sections.conflictAnalysis) {
      sectionsHTML += this.generateConflictAnalysisSection(report.sections.conflictAnalysis);
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${header}</title>
    <style>${styles}</style>
</head>
<body>
    <div class="report-container">
        <header class="report-header">
            ${logo ? `<img src="${logo}" alt="Logo" class="logo">` : ''}
            <h1>${header}</h1>
            <p class="generated-date">Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
        </header>
        
        <main class="report-content">
            ${sectionsHTML}
        </main>
        
        <footer class="report-footer">
            <p>${footer}</p>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Generate PDF report (returns a mock Blob for now)
   */
  private generatePDFReport(report: BaseReport, config: ReportConfiguration): Blob {
    // In a real implementation, this would use a library like jsPDF or Puppeteer
    const htmlContent = this.generateHTMLReport(report, config);
    return new Blob([htmlContent], { type: 'application/pdf' });
  }

  /**
   * Get CSS styles for the template
   */
  private getTemplateStyles(template: string): string {
    const baseStyles = `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
      .report-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .report-header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
      .report-header h1 { margin: 0; font-size: 28px; font-weight: 300; }
      .generated-date { margin: 10px 0 0; opacity: 0.8; }
      .logo { max-height: 60px; margin-bottom: 15px; }
      .report-content { padding: 40px; }
      .section { margin-bottom: 40px; }
      .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
      .report-footer { background: #ecf0f1; padding: 20px; text-align: center; color: #7f8c8d; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #3498db; color: white; font-weight: 500; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
      .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
      .summary-card h3 { margin: 0 0 10px; color: #2c3e50; }
      .summary-card .value { font-size: 24px; font-weight: bold; color: #3498db; }
    `;

    switch (template) {
      case 'medical':
        return baseStyles + `
          .report-header { background: #27ae60; }
          th { background-color: #27ae60; }
          .summary-card { border-left-color: #27ae60; }
          .summary-card .value { color: #27ae60; }
          .section h2 { border-bottom-color: #27ae60; }
        `;
      case 'simple':
        return baseStyles.replace(/box-shadow[^;]*;/, '').replace(/border-radius[^;]*;/, '');
      default:
        return baseStyles;
    }
  }

  private generateSummarySection(summary: any): string {
    return `
      <div class="section">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Codes</h3>
            <div class="value">${summary.totalCodes || 0}</div>
          </div>
          <div class="summary-card">
            <h3>Total Fee</h3>
            <div class="value">$${(summary.totalFee || 0).toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <h3>Context</h3>
            <div class="value">${summary.consultationContext || 'N/A'}</div>
          </div>
          <div class="summary-card">
            <h3>Conflicts</h3>
            <div class="value">${summary.conflictsDetected ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    `;
  }

  private generateSelectedCodesTable(codes: any[]): string {
    if (!codes || codes.length === 0) return '';

    const rows = codes.map(code => `
      <tr>
        <td>${code.code}</td>
        <td>${code.description}</td>
        <td>$${code.scheduleFee.toFixed(2)}</td>
        <td>${(code.confidence * 100).toFixed(1)}%</td>
        <td>${code.category || 'N/A'}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Selected MBS Codes</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Schedule Fee</th>
              <th>Confidence</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateBillingSection(billing: any): string {
    if (!billing) return '';

    const itemRows = billing.itemizedCharges?.map((item: any) => `
      <tr>
        <td>${item.code}</td>
        <td>${item.description}</td>
        <td>$${item.fee.toFixed(2)}</td>
      </tr>
    `).join('') || '';

    return `
      <div class="section">
        <h2>Billing Information</h2>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold;">
          Total: $${(billing.subtotal || billing.total || 0).toFixed(2)}
        </div>
      </div>
    `;
  }

  private generateCategoryBreakdownSection(categories: any[]): string {
    if (!categories || categories.length === 0) return '';

    const rows = categories.map(cat => `
      <tr>
        <td>${cat.categoryName}</td>
        <td>${cat.codeCount}</td>
        <td>$${cat.totalFee.toFixed(2)}</td>
        <td>${cat.codes.join(', ')}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Code Count</th>
              <th>Total Fee</th>
              <th>Codes</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateConflictAnalysisSection(analysis: any): string {
    if (!analysis) return '';

    return `
      <div class="section">
        <h2>Conflict Analysis</h2>
        <p><strong>Conflicts Detected:</strong> ${analysis.hasConflicts ? 'Yes' : 'No'}</p>
        ${analysis.blockingConflicts?.length > 0 ? `
          <h3>Blocking Conflicts</h3>
          <ul>
            ${analysis.blockingConflicts.map((conflict: any) => `
              <li><strong>${conflict.reason}:</strong> ${conflict.message}</li>
            `).join('')}
          </ul>
        ` : ''}
        ${analysis.warnings?.length > 0 ? `
          <h3>Warnings</h3>
          <ul>
            ${analysis.warnings.map((warning: string) => `<li>${warning}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCategoryName(category: MBSCategory): string {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function generateConflictResolutions(conflicts: ConflictRule[]): string[] {
  const resolutions: string[] = [];
  
  conflicts.forEach(conflict => {
    if (conflict.reason === 'category_exclusive_consultation') {
      resolutions.push('Select only one consultation level per visit');
    } else if (conflict.reason === 'specialty_service_conflict') {
      resolutions.push('Consider billing specialty services in separate consultations');
    } else {
      resolutions.push(`Resolve ${conflict.reason} by reviewing code compatibility`);
    }
  });

  return [...new Set(resolutions)];
}

function generateDetailedResolutionSuggestions(
  conflicts: ConflictRule[],
  recommendations: EnhancedCodeRecommendation[]
): Array<{
  conflictingCodes: string[];
  suggestedAction: string;
  reasoning: string;
  expectedOutcome: string;
}> {
  return conflicts.map(conflict => ({
    conflictingCodes: conflict.conflictingCodes,
    suggestedAction: generateSuggestedAction(conflict),
    reasoning: conflict.message,
    expectedOutcome: conflict.severity === 'blocking' ? 
      'Resolves billing conflict' : 
      'Reduces scheduling complexity'
  }));
}

function generateSuggestedAction(conflict: ConflictRule): string {
  switch (conflict.reason) {
    case 'category_exclusive_consultation':
      return 'Choose the highest appropriate consultation level';
    case 'specialty_service_conflict':
      return 'Bill specialty services in separate consultation';
    case 'time_overlap':
      return 'Schedule procedures at different times';
    default:
      return 'Review code combination for compliance';
  }
}

function deduplicateConflicts(conflicts: ConflictRule[]): ConflictRule[] {
  const seen = new Set<string>();
  return conflicts.filter(conflict => {
    const key = JSON.stringify({
      codes: conflict.conflictingCodes.sort(),
      reason: conflict.reason
    });
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}