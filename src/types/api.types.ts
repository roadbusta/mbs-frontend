/**
 * API Type Definitions for MBS RAG Frontend
 * 
 * This file serves as the contract between frontend and backend.
 * It defines the expected request and response structures for the MBS API.
 * 
 * Based on the actual backend implementation from src/api/models.py
 */

// ============================================================================
// Request Types
// ============================================================================

/**
 * Consultation context types supported by the backend
 */
export type ConsultationContext = 
  | 'general_practice'
  | 'emergency_department'
  | 'specialist'
  | 'mental_health'
  | 'telehealth'
  | 'other';

/**
 * Options for the analysis request
 */
export interface AnalysisOptions {
  /** Maximum number of MBS codes to return (1-10) */
  max_codes?: number;
  /** Minimum confidence threshold (0.0-1.0) */
  min_confidence?: number;
  /** Include detailed reasoning in response */
  include_reasoning?: boolean;
}

/**
 * Main analysis request structure
 */
export interface AnalysisRequest {
  /** The consultation note text to analyze */
  consultation_note: string;
  /** Consultation context to help with accurate code selection */
  context?: ConsultationContext;
  /** Optional configuration for the analysis */
  options?: AnalysisOptions;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Text evidence span that supports a code recommendation
 */
export interface EvidenceSpan {
  /** Start position in consultation text */
  start: number;
  /** End position in consultation text */
  end: number;
  /** Text content of the evidence */
  text: string;
  /** Relevance score for this evidence */
  relevance?: number;
}

/**
 * Individual MBS code recommendation
 */
export interface CodeRecommendation {
  /** MBS item code (e.g., "5012") */
  code: string;
  /** Description of the MBS item */
  description: string;
  /** Confidence score (0.0-1.0) */
  confidence: number;
  /** Medical reasoning for this recommendation */
  reasoning?: string;
  /** Schedule fee amount in AUD */
  schedule_fee: number;
  /** MBS category (e.g., "1" for Professional Attendances) */
  category?: string;
  /** Evidence spans from consultation text that support this code */
  evidence_spans?: EvidenceSpan[];
}

/**
 * Categorization information from the intelligent pre-filter
 */
export interface CategorizationInfo {
  /** Main category identified */
  primary_category: number;
  /** Human-readable category name */
  category_name: string;
  /** Specific MBS group (e.g., "A1", "A21") */
  group_focus: string;
  /** Type of consultation (e.g., "general_practice", "emergency_department", "specialist") */
  context: string;
  /** Complexity level ("brief", "standard", "long") */
  complexity: string;
  /** Confidence in the categorization */
  confidence: number;
  /** Percentage of codes filtered out */
  reduction_percentage: number;
}

/**
 * Pipeline processing metrics
 */
export interface PipelineMetrics {
  /** Number of candidates from TF-IDF stage */
  tfidf_candidates: number;
  /** Number of candidates from embedding stage */
  embedding_candidates: number;
  /** Number analyzed by LLM */
  llm_analyzed: number;
}

/**
 * Metadata about the processing
 */
export interface ProcessingMetadata {
  /** Total processing time in milliseconds */
  processing_time_ms: number;
  /** Detailed pipeline stage metrics */
  pipeline_stages?: PipelineMetrics;
  /** Model used for LLM reasoning */
  model_used?: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Categorization information if available */
  categorization?: CategorizationInfo;
}

/**
 * Successful analysis response
 */
export interface AnalysisSuccessResponse {
  /** Indicates successful processing */
  status: 'success';
  /** List of recommended MBS codes */
  recommendations: CodeRecommendation[];
  /** Metadata about the processing */
  metadata: ProcessingMetadata;
}

/**
 * Error response from the API (500 errors)
 */
export interface AnalysisErrorResponse {
  /** Indicates processing failure */
  status: 'error';
  /** Error message */
  message: string;
  /** Additional error details */
  detail?: string;
}

/**
 * Validation error response (422)
 */
export interface ValidationErrorResponse {
  /** Validation error details */
  detail: Array<{
    /** Location of the error */
    loc: string[];
    /** Error message */
    msg: string;
    /** Error type */
    type: string;
  }>;
}

/**
 * Union type for all possible API responses
 */
export type AnalysisResponse = AnalysisSuccessResponse | AnalysisErrorResponse | ValidationErrorResponse;

// ============================================================================
// Health Check Types
// ============================================================================

/**
 * Component health check details
 */
export interface ComponentHealthCheck {
  /** Health status */
  healthy: boolean;
  /** Status message */
  message: string;
  /** Additional details */
  details?: Record<string, any>;
}

/**
 * Health check response
 */
export interface HealthResponse {
  /** Overall status */
  status: 'healthy' | 'unhealthy';
  /** API version */
  version: string;
  /** Individual component checks */
  checks: {
    mbs_codes: ComponentHealthCheck;
    embeddings: ComponentHealthCheck;
    llm_provider: ComponentHealthCheck;
    cache: ComponentHealthCheck;
  };
  /** Uptime in seconds */
  uptime_seconds: number;
  /** Cache statistics */
  cache_stats?: {
    hits: number;
    misses: number;
    size: number;
  };
}

/**
 * Readiness check response
 */
export interface ReadinessResponse {
  /** Whether service is ready */
  ready: boolean;
  /** Component readiness status */
  components: {
    mbs_codes: boolean;
    embeddings: boolean;
    llm: boolean;
  };
  /** Message if not ready */
  message?: string;
}

/**
 * Liveness check response
 */
export interface LivenessResponse {
  /** Whether service is alive */
  alive: boolean;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(
  response: AnalysisResponse
): response is AnalysisSuccessResponse {
  return 'status' in response && response.status === 'success';
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: AnalysisResponse
): response is AnalysisErrorResponse {
  return 'status' in response && response.status === 'error';
}

/**
 * Type guard to check if response is a validation error
 */
export function isValidationError(
  response: any
): response is ValidationErrorResponse {
  return 'detail' in response && Array.isArray(response.detail);
}

// ============================================================================
// Feedback Types
// ============================================================================

/**
 * User feedback on MBS code recommendation quality
 */
export interface CodeFeedback {
  /** The MBS code this feedback relates to */
  code: string;
  /** User's rating of the recommendation */
  rating: 'positive' | 'negative' | 'neutral';
  /** Optional detailed feedback from the user */
  comment?: string;
  /** Timestamp when feedback was provided */
  timestamp: string;
  /** Whether this code should have been suggested */
  should_suggest: boolean;
}

/**
 * User suggestion for an alternative MBS code
 */
export interface CodeSuggestion {
  /** The suggested MBS code */
  suggested_code: string;
  /** User's rationale for suggesting this code */
  rationale: string;
  /** Confidence in this suggestion (1-5 scale) */
  confidence: number;
  /** Whether to replace an existing recommendation or add new */
  action: 'replace' | 'add';
  /** If replacing, which code to replace */
  replace_code?: string;
  /** Timestamp when suggestion was made */
  timestamp: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default values for analysis options
 */
export const DEFAULT_OPTIONS: Required<AnalysisOptions> = {
  max_codes: 5,
  min_confidence: 0.6,
  include_reasoning: true,
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  analyze: '/api/v1/analyze',
  health: '/health',
  ready: '/ready',
  live: '/live',
} as const;

/**
 * MBS Online URL template
 */
export const MBS_ONLINE_URL_TEMPLATE = 
  'https://www9.health.gov.au/mbs/fullDisplay.cfm?type=item&q={code}&qt=item&criteria={code}';

/**
 * Generate MBS Online URL for a given code
 */
export function getMBSOnlineUrl(code: string): string {
  return MBS_ONLINE_URL_TEMPLATE.replace(/{code}/g, code);
}

// ============================================================================
// MBS Code Selection & Conflict Detection Types (Phase 1)
// ============================================================================

/**
 * Types of conflicts that can occur between MBS codes
 */
export type ConflictReason = 
  | 'time_overlap'        // Cannot bill both in same consultation
  | 'category_exclusive'  // Only one from category allowed
  | 'age_restriction'     // Age-based conflicts
  | 'frequency_limit'     // Daily/weekly limits
  | 'prerequisite_missing' // Requires another code first
  | 'medicare_rule';      // General Medicare billing rules

/**
 * MBS categories for conflict detection
 */
export type MBSCategory = 
  | 'professional_attendances'
  | 'diagnostic_procedures'
  | 'therapeutic_procedures'
  | 'oral_maxillofacial'
  | 'diagnostic_imaging'
  | 'pathology'
  | 'cleft_palate'
  | 'chemotherapy'
  | 'radiotherapy'
  | 'assistant_surgeon'
  | 'relative_value_guide'
  | 'acupuncture';

/**
 * Conflict rule defining when codes cannot be selected together
 */
export interface ConflictRule {
  /** Codes that conflict with each other */
  conflictingCodes: string[];
  /** Type of conflict */
  reason: ConflictReason;
  /** Whether this is a hard block or soft warning */
  severity: 'warning' | 'blocking';
  /** Human-readable explanation */
  message: string;
  /** Optional category this conflict applies to */
  category?: string;
  /** Optional conditions when this rule applies */
  conditions?: string[];
}

/**
 * Exclusion rule for codes that cannot be billed together
 */
export interface ExclusionRule {
  /** Codes that are excluded by this rule */
  excludedCodes: string[];
  /** Reason for exclusion */
  reason: string;
  /** Conditions when exclusion applies */
  conditions?: string[];
}

/**
 * Enhanced code recommendation with conflict detection fields
 */
export interface EnhancedCodeRecommendation extends CodeRecommendation {
  /** Conflict rules that apply to this code */
  conflicts: ConflictRule[];
  /** Codes that are compatible with this one */
  compatibleWith: string[];
  /** MBS category for conflict resolution */
  mbsCategory: MBSCategory;
  /** Time requirement in minutes (for time overlap detection) */
  timeRequirement?: number;
  /** Exclusion rules that apply */
  exclusionRules?: ExclusionRule[];
}

/**
 * Current selection state with conflict tracking
 */
export interface SelectionState {
  /** Set of currently selected MBS codes */
  selectedCodes: Set<string>;
  /** Map of conflicts for each code */
  conflicts: Map<string, ConflictRule[]>;
  /** Total fee for selected codes */
  totalFee: number;
  /** Warning messages for the current selection */
  warnings: string[];
}

/**
 * Result of conflict validation
 */
export interface ConflictValidation {
  /** Whether the code can be selected */
  canSelect: boolean;
  /** Blocking conflicts preventing selection */
  conflicts: ConflictRule[];
  /** Warning-level conflicts */
  warnings: string[];
  /** Suggested actions to resolve conflicts */
  suggestions?: string[];
}

/**
 * Summary of current selection
 */
export interface SelectionSummary {
  /** Number of selected codes */
  selectedCount: number;
  /** Total fee amount */
  totalFee: number;
  /** Number of conflicts detected */
  conflictCount: number;
  /** Whether there are any blocking conflicts */
  hasBlockingConflicts: boolean;
  /** Warning messages */
  warnings: string[];
}

/**
 * Validation result for entire selection
 */
export interface SelectionValidation {
  /** Whether the entire selection is valid */
  isValid: boolean;
  /** Blocking conflicts in the selection */
  blockingConflicts: ConflictRule[];
  /** Warning-level issues */
  warnings: string[];
  /** Suggested fixes */
  suggestions: string[];
}

// ============================================================================
// Conflict Detection Functions
// ============================================================================

/**
 * Detect conflicts when trying to select a new code
 */
export function detectConflicts(
  selectedCodes: Set<string>,
  newCode: string,
  allRecommendations: EnhancedCodeRecommendation[]
): ConflictValidation {
  const conflicts: ConflictRule[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Find the recommendation for the new code
  const newRecommendation = allRecommendations.find(rec => rec.code === newCode);
  if (!newRecommendation) {
    return { canSelect: false, conflicts: [], warnings: ['Code not found in recommendations'] };
  }
  
  // Check each conflict rule for the new code
  for (const conflictRule of newRecommendation.conflicts) {
    const hasConflict = Array.from(selectedCodes).some(selectedCode => 
      conflictRule.conflictingCodes.includes(selectedCode)
    );
    
    if (hasConflict) {
      if (conflictRule.severity === 'blocking') {
        conflicts.push(conflictRule);
        suggestions.push(`Deselect conflicting codes: ${conflictRule.conflictingCodes.filter(code => selectedCodes.has(code)).join(', ')}`);
      } else {
        warnings.push(conflictRule.message);
      }
    }
  }
  
  // Check conflicts from selected codes that might affect the new code
  for (const selectedCode of selectedCodes) {
    const selectedRecommendation = allRecommendations.find(rec => rec.code === selectedCode);
    if (selectedRecommendation) {
      for (const conflictRule of selectedRecommendation.conflicts) {
        if (conflictRule.conflictingCodes.includes(newCode)) {
          if (conflictRule.severity === 'blocking') {
            conflicts.push(conflictRule);
          } else {
            warnings.push(conflictRule.message);
          }
        }
      }
    }
  }
  
  // Deduplicate conflicts based on conflicting codes
  const uniqueConflicts = conflicts.filter((conflict, index, self) => 
    index === self.findIndex(c => 
      JSON.stringify(c.conflictingCodes.sort()) === JSON.stringify(conflict.conflictingCodes.sort()) &&
      c.reason === conflict.reason
    )
  );

  return {
    canSelect: uniqueConflicts.length === 0,
    conflicts: uniqueConflicts,
    warnings: [...new Set(warnings)], // Remove duplicate warnings
    suggestions: [...new Set(suggestions)] // Remove duplicate suggestions
  };
}

/**
 * Calculate summary for current selection
 */
export function calculateSelectionSummary(
  selectedCodes: Set<string>,
  allRecommendations: EnhancedCodeRecommendation[]
): SelectionSummary {
  let totalFee = 0;
  let conflictCount = 0;
  let hasBlockingConflicts = false;
  const warnings: string[] = [];
  
  // Calculate total fee
  for (const code of selectedCodes) {
    const recommendation = allRecommendations.find(rec => rec.code === code);
    if (recommendation) {
      totalFee += recommendation.schedule_fee;
    }
  }
  
  // Check for conflicts between selected codes
  const selectedArray = Array.from(selectedCodes);
  for (let i = 0; i < selectedArray.length; i++) {
    for (let j = i + 1; j < selectedArray.length; j++) {
      const validation = detectConflicts(
        new Set([selectedArray[i]]), 
        selectedArray[j], 
        allRecommendations
      );
      
      if (validation.conflicts.length > 0) {
        conflictCount += validation.conflicts.length;
        hasBlockingConflicts = true;
      }
      
      warnings.push(...validation.warnings);
    }
  }
  
  return {
    selectedCount: selectedCodes.size,
    totalFee: Math.round(totalFee * 100) / 100, // Round to 2 decimal places
    conflictCount,
    hasBlockingConflicts,
    warnings: [...new Set(warnings)] // Remove duplicates
  };
}

/**
 * Validate entire selection state
 */
export function validateCodeSelection(
  selectionState: SelectionState,
  allRecommendations: EnhancedCodeRecommendation[]
): SelectionValidation {
  const blockingConflicts: ConflictRule[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const selectedArray = Array.from(selectionState.selectedCodes);
  
  // Check each pair of selected codes for conflicts
  for (let i = 0; i < selectedArray.length; i++) {
    for (let j = i + 1; j < selectedArray.length; j++) {
      const validation = detectConflicts(
        new Set([selectedArray[i]]), 
        selectedArray[j], 
        allRecommendations
      );
      
      blockingConflicts.push(...validation.conflicts);
      warnings.push(...validation.warnings);
      if (validation.suggestions) {
        suggestions.push(...validation.suggestions);
      }
    }
  }
  
  return {
    isValid: blockingConflicts.length === 0,
    blockingConflicts,
    warnings: [...new Set(warnings)],
    suggestions: [...new Set(suggestions)]
  };
}