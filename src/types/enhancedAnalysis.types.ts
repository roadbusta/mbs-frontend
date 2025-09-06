/**
 * Enhanced Analysis Types for Phase 3
 * 
 * Extended data structures for advanced code analysis interface,
 * evidence highlighting, and enhanced user interactions.
 */

import { CodeRecommendation } from './api.types';

/**
 * Evidence span highlighting in clinical text
 */
export interface EvidenceSpan {
  /** Start position in text */
  start: number;
  /** End position in text */
  end: number;
  /** Highlighted text content */
  text: string;
  /** Relevance score (0-1) */
  relevanceScore: number;
  /** Evidence category */
  category: EvidenceCategory;
  /** Associated MBS code */
  relatedCode?: string;
  /** Confidence in this evidence */
  confidence: number;
}

/**
 * Types of clinical evidence
 */
export type EvidenceCategory = 
  | 'symptoms'
  | 'diagnosis' 
  | 'procedures'
  | 'medications'
  | 'investigations'
  | 'clinical_findings'
  | 'patient_history'
  | 'treatment_plan';

/**
 * Detailed reasoning for code recommendations
 */
export interface DetailedReasoning {
  /** Primary evidence supporting this code */
  primaryEvidence: string[];
  /** Supporting clinical factors */
  supportingFactors: string[];
  /** Clinical context and background */
  clinicalContext: string;
  /** Breakdown of confidence calculation */
  confidenceBreakdown: ConfidenceBreakdown;
  /** Alternative codes considered */
  alternativesConsidered?: AlternativeCode[];
}

/**
 * Confidence calculation breakdown
 */
export interface ConfidenceBreakdown {
  /** Evidence strength (0-1) */
  evidenceStrength: number;
  /** Clinical relevance (0-1) */
  clinicalRelevance: number;
  /** Code specificity match (0-1) */
  specificityMatch: number;
  /** Historical accuracy for similar cases (0-1) */
  historicalAccuracy: number;
  /** Final weighted score */
  weightedScore: number;
}

/**
 * Alternative codes that were considered
 */
export interface AlternativeCode {
  /** Alternative MBS code */
  code: string;
  /** Reason it wasn't selected */
  rejectionReason: string;
  /** Confidence score it would have had */
  alternativeConfidence: number;
}

/**
 * Enhanced fee calculation details
 */
export interface FeeCalculation {
  /** Base schedule fee */
  scheduleFee: number;
  /** GST amount */
  gst: number;
  /** Total fee including GST */
  totalFee: number;
  /** Bulk billing eligible */
  bulkBillingEligible: boolean;
  /** Medicare rebate amount */
  medicareRebate: number;
  /** Patient gap payment */
  patientGap: number;
  /** Fee notes and conditions */
  feeNotes?: string[];
}

/**
 * Confidence factors affecting recommendation
 */
export interface ConfidenceFactors {
  /** Factors that increase confidence */
  positiveFactors: ConfidenceFactor[];
  /** Factors that decrease confidence */
  negativeFactors: ConfidenceFactor[];
  /** Overall confidence level */
  overallLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
}

/**
 * Individual confidence factor
 */
export interface ConfidenceFactor {
  /** Factor description */
  description: string;
  /** Impact on confidence (-1 to 1) */
  impact: number;
  /** Category of factor */
  category: 'clinical' | 'procedural' | 'contextual' | 'historical';
}

/**
 * Enhanced code recommendation with Phase 3 features
 */
export interface EnhancedCodeRecommendation extends CodeRecommendation {
  /** Evidence spans in clinical text */
  evidenceSpans: EvidenceSpan[];
  /** Detailed clinical reasoning */
  detailedReasoning: DetailedReasoning;
  /** Confidence calculation factors */
  confidenceFactors: ConfidenceFactors;
  /** Enhanced fee calculation */
  feeCalculation: FeeCalculation;
  /** Selection state for UI */
  selectionState: CodeSelectionState;
  /** Conflicts with other selected codes */
  conflicts: ConflictInfo[];
  /** Compatible codes that can be selected together */
  compatibleCodes: string[];
}

/**
 * Code selection states for enhanced UI
 */
export type CodeSelectionState = 
  | 'available'      // Can be selected
  | 'selected'       // Currently selected
  | 'compatible'     // Compatible with current selection
  | 'conflict'       // Conflicts with current selection
  | 'blocked'        // Cannot be selected due to rules
  | 'suggested';     // System suggestion

/**
 * Conflict information
 */
export interface ConflictInfo {
  /** Conflicting code */
  conflictingCode: string;
  /** Type of conflict */
  conflictType: ConflictType;
  /** Description of conflict */
  description: string;
  /** Severity level */
  severity: 'blocking' | 'warning' | 'info';
  /** Suggested resolution */
  resolution?: string;
}

/**
 * Types of code conflicts
 */
export type ConflictType = 
  | 'mutually_exclusive'
  | 'duplicate_service'
  | 'timing_restriction'
  | 'age_restriction'
  | 'clinical_incompatibility'
  | 'billing_rule_violation';

/**
 * Sample consultation text for testing
 */
export interface SampleConsultation {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Consultation context */
  context: string;
  /** Clinical notes text */
  text: string;
  /** Expected MBS codes for validation */
  expectedCodes: string[];
  /** Difficulty level */
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'complex';
  /** Clinical specialty */
  specialty?: string;
}

/**
 * Bulk selection operation
 */
export interface BulkSelectionOperation {
  /** Type of operation */
  operation: 'select_all' | 'select_none' | 'select_high_confidence' | 'select_compatible';
  /** Codes affected */
  affectedCodes: string[];
  /** Validation results */
  validationResults: BulkValidationResult[];
}

/**
 * Bulk validation result
 */
export interface BulkValidationResult {
  /** Code being validated */
  code: string;
  /** Whether selection is valid */
  isValid: boolean;
  /** Issues preventing selection */
  issues: string[];
  /** Warnings about selection */
  warnings: string[];
}

/**
 * Analysis progress information
 */
export interface AnalysisProgress {
  /** Current step in analysis */
  currentStep: AnalysisStep;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Estimated time remaining (seconds) */
  estimatedTimeRemaining?: number;
  /** Whether operation can be cancelled */
  cancellable: boolean;
  /** Current status message */
  statusMessage: string;
}

/**
 * Analysis steps for progress tracking
 */
export type AnalysisStep = 
  | 'parsing_text'
  | 'extracting_entities'
  | 'analyzing_context'
  | 'matching_codes'
  | 'calculating_confidence'
  | 'validating_results'
  | 'finalizing';

/**
 * Text selection and annotation
 */
export interface TextSelection {
  /** Selected text */
  text: string;
  /** Selection start position */
  start: number;
  /** Selection end position */
  end: number;
  /** User annotation */
  annotation?: string;
  /** Associated evidence category */
  category?: EvidenceCategory;
  /** Confidence in selection */
  confidence?: number;
}