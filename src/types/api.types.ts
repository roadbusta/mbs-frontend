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