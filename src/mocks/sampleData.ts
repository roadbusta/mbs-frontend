/**
 * Sample data for testing and development
 * These mock responses match the actual API response structure
 */

import type { 
  AnalysisSuccessResponse, 
  AnalysisErrorResponse,
  ValidationErrorResponse 
} from '../types/api.types';

/**
 * Sample consultation notes for testing
 */
export const SAMPLE_CONSULTATION_NOTES = {
  standard_gp: `Patient presented with persistent cough lasting 3 weeks, accompanied by mild fever. 
Physical examination revealed clear lungs, no wheezing. Throat slightly inflamed. 
Discussed symptom management and prescribed antibiotics. 
Advised to return if symptoms persist beyond one week. 
Consultation duration: 20 minutes.`,

  emergency_department: `Emergency Department consultation for acute chest pain. 
Patient presented with severe central chest pain radiating to left arm. 
ECG performed showing ST elevation in leads II, III, aVF. 
Troponin levels elevated. Diagnosed with STEMI. 
Immediate cardiology referral initiated. Thrombolysis commenced. 
Total consultation and initial management: 45 minutes.`,

  specialist_referral: `Complex consultation for diabetes management. 
Patient referred by GP for specialist endocrinology review. 
HbA1c 9.2%, multiple complications including retinopathy and neuropathy. 
Comprehensive review of medication regime, insulin adjustment required. 
Discussed continuous glucose monitoring options. 
Arranged ophthalmology and podiatry referrals. 
Consultation duration: 40 minutes.`,

  mental_health: `Mental health consultation for anxiety and depression. 
Patient reports increased anxiety over past 2 months, sleep disturbance, and low mood. 
PHQ-9 score: 16 (moderate-severe depression). GAD-7 score: 12 (moderate anxiety). 
Discussed cognitive behavioral therapy options and medication management. 
Developed mental health care plan. Referral to psychologist arranged. 
Consultation duration: 35 minutes.`,

  telehealth: `Telehealth video consultation for follow-up of hypertension. 
Blood pressure readings reviewed from home monitoring: averaging 145/90. 
Current medications discussed, dosage adjustment made for ACE inhibitor. 
Lifestyle modifications reinforced including diet and exercise. 
Next review scheduled in 3 months. 
Video consultation duration: 15 minutes.`,
};

/**
 * Generate evidence spans for the standard GP consultation
 * Currently unused but kept for future dynamic evidence span generation
 */
// function generateStandardGPEvidenceSpans(consultationNote: string) {
//   return {
//     '23': [
//       {
//         start: consultationNote.indexOf('persistent cough lasting 3 weeks'),
//         end: consultationNote.indexOf('persistent cough lasting 3 weeks') + 'persistent cough lasting 3 weeks'.length,
//         text: 'persistent cough lasting 3 weeks',
//         relevance: 0.9
//       },
//       {
//         start: consultationNote.indexOf('Physical examination revealed'),
//         end: consultationNote.indexOf('Physical examination revealed') + 'Physical examination revealed clear lungs, no wheezing'.length,
//         text: 'Physical examination revealed clear lungs, no wheezing',
//         relevance: 0.8
//       },
//       {
//         start: consultationNote.indexOf('Consultation duration: 20 minutes'),
//         end: consultationNote.indexOf('Consultation duration: 20 minutes') + 'Consultation duration: 20 minutes'.length,
//         text: 'Consultation duration: 20 minutes',
//         relevance: 0.95
//       }
//     ],
//     '36': [
//       {
//         start: consultationNote.indexOf('Discussed symptom management'),
//         end: consultationNote.indexOf('Discussed symptom management') + 'Discussed symptom management and prescribed antibiotics'.length,
//         text: 'Discussed symptom management and prescribed antibiotics',
//         relevance: 0.7
//       },
//       {
//         start: consultationNote.indexOf('Advised to return if symptoms persist'),
//         end: consultationNote.indexOf('Advised to return if symptoms persist') + 'Advised to return if symptoms persist beyond one week'.length,
//         text: 'Advised to return if symptoms persist beyond one week',
//         relevance: 0.6
//       }
//     ]
//   };
// }

/**
 * Sample successful API response
 */
export const SAMPLE_SUCCESS_RESPONSE: AnalysisSuccessResponse = {
  status: 'success',
  recommendations: [
    {
      code: '23',
      description: 'Level B consultation lasting less than 20 minutes',
      confidence: 0.92,
      reasoning: 'The consultation involved a 20-minute GP attendance with physical examination, diagnosis, and treatment prescription for respiratory symptoms.',
      schedule_fee: 41.40,
      category: '1',
      evidence_spans: [
        {
          start: 17,
          end: 50,
          text: 'persistent cough lasting 3 weeks',
          relevance: 0.9
        },
        {
          start: 83,
          end: 136,
          text: 'Physical examination revealed clear lungs, no wheezing',
          relevance: 0.8
        },
        {
          start: 240,
          end: 274,
          text: 'Consultation duration: 20 minutes',
          relevance: 0.95
        }
      ]
    },
    {
      code: '36',
      description: 'Level C consultation lasting at least 20 minutes',
      confidence: 0.75,
      reasoning: 'While primarily a physical health consultation, there may be mental health components given the duration and comprehensive nature.',
      schedule_fee: 79.00,
      category: '1',
      evidence_spans: [
        {
          start: 168,
          end: 216,
          text: 'Discussed symptom management and prescribed antibiotics',
          relevance: 0.7
        },
        {
          start: 218,
          end: 274,
          text: 'Advised to return if symptoms persist beyond one week',
          relevance: 0.6
        }
      ]
    },
    {
      code: '44',
      description: 'Level D consultation lasting at least 40 minutes',
      confidence: 0.68,
      reasoning: 'The consultation included multiple issues and comprehensive management planning.',
      schedule_fee: 116.30,
      category: '1',
      evidence_spans: [
        {
          start: 168,
          end: 274,
          text: 'Discussed symptom management and prescribed antibiotics. Advised to return if symptoms persist beyond one week',
          relevance: 0.6
        }
      ]
    },
  ],
  metadata: {
    processing_time_ms: 8543,
    pipeline_stages: {
      tfidf_candidates: 50,
      embedding_candidates: 20,
      llm_analysed: 20,
    },
    model_used: 'gpt-4o-mini',
    timestamp: new Date().toISOString(),
    categorization: {
      primary_category: 1,
      category_name: 'Professional Attendances',
      group_focus: 'A1',
      context: 'general_practice',
      complexity: 'standard',
      confidence: 0.9,
      reduction_percentage: 86.7,
    },
  },
};

/**
 * Sample error response
 */
export const SAMPLE_ERROR_RESPONSE: AnalysisErrorResponse = {
  status: 'error',
  message: 'Failed to process consultation note',
  detail: 'LLM service temporarily unavailable. Please try again.',
};

/**
 * Sample timeout error response
 */
export const SAMPLE_TIMEOUT_ERROR: AnalysisErrorResponse = {
  status: 'error',
  message: 'Request timeout',
  detail: 'The request took too long to process. Please try again with a shorter consultation note.',
};

/**
 * Sample validation error response
 */
export const SAMPLE_VALIDATION_ERROR: ValidationErrorResponse = {
  detail: [
    {
      loc: ['body', 'consultation_note'],
      msg: 'ensure this value has at least 10 characters',
      type: 'value_error.any_str.min_length',
    },
  ],
};

/**
 * Generate a mock delay to simulate API response time
 */
export function mockApiDelay(minMs: number = 1000, maxMs: number = 3000): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock API function for development without backend
 */
export async function mockAnalyzeConsultation(
  note: string,
  simulateError: boolean = false
): Promise<AnalysisSuccessResponse | AnalysisErrorResponse> {
  await mockApiDelay();

  if (simulateError) {
    return Math.random() > 0.5 ? SAMPLE_ERROR_RESPONSE : SAMPLE_TIMEOUT_ERROR;
  }

  if (note.length < 10) {
    throw new Error('Consultation note must be at least 10 characters long');
  }

  // Return different responses based on keywords in the note
  if (note.toLowerCase().includes('emergency')) {
    return {
      ...SAMPLE_SUCCESS_RESPONSE,
      recommendations: [
        {
          code: '501',
          description: 'Emergency department attendance',
          confidence: 0.95,
          reasoning: 'Emergency department consultation for acute chest pain with ECG findings and elevated troponin levels indicating STEMI.',
          schedule_fee: 150.00,
          category: '3',
          evidence_spans: [
            {
              start: note.indexOf('Emergency Department consultation'),
              end: note.indexOf('Emergency Department consultation') + 'Emergency Department consultation for acute chest pain'.length,
              text: 'Emergency Department consultation for acute chest pain',
              relevance: 0.95
            },
            {
              start: note.indexOf('ECG performed showing ST elevation'),
              end: note.indexOf('ECG performed showing ST elevation') + 'ECG performed showing ST elevation in leads II, III, aVF'.length,
              text: 'ECG performed showing ST elevation in leads II, III, aVF',
              relevance: 0.9
            },
            {
              start: note.indexOf('Troponin levels elevated'),
              end: note.indexOf('Troponin levels elevated') + 'Troponin levels elevated'.length,
              text: 'Troponin levels elevated',
              relevance: 0.85
            },
            {
              start: note.indexOf('Total consultation and initial management: 45 minutes'),
              end: note.indexOf('Total consultation and initial management: 45 minutes') + 'Total consultation and initial management: 45 minutes'.length,
              text: 'Total consultation and initial management: 45 minutes',
              relevance: 0.8
            }
          ]
        },
      ],
      metadata: {
        ...SAMPLE_SUCCESS_RESPONSE.metadata,
        categorization: {
          primary_category: 3,
          category_name: 'Emergency Medicine',
          group_focus: 'A21',
          context: 'emergency_department',
          complexity: 'standard',
          confidence: 0.98,
          reduction_percentage: 89.1,
        },
      },
    };
  }

  return SAMPLE_SUCCESS_RESPONSE;
}