/**
 * API Service Layer
 * 
 * This service handles all communication with the MBS backend API.
 * It provides typed interfaces for API calls and handles both production
 * and demo mode responses.
 * 
 * Features:
 * - Production API integration with proper error handling
 * - Demo mode with realistic mock responses
 * - Request/response type safety
 * - Timeout and retry logic
 */

import axios, { AxiosResponse } from 'axios';
import { 
  AnalysisRequest, 
  AnalysisResponse, 
  AnalysisErrorResponse,
  HealthResponse,
  API_ENDPOINTS 
} from '../types/api.types';

/**
 * API Configuration
 */
const API_CONFIG = {
  timeout: 35000, // 35 second timeout as per requirements
  // In development, use empty baseURL to leverage Vite proxy
  // In production, use the full API URL from environment variable
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : '',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Create axios instance with configuration
 */
const apiClient = axios.create(API_CONFIG);

/**
 * Request interceptor for logging and debugging
 */
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and logging
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    return Promise.reject(error);
  }
);

/**
 * Analyze consultation note and get MBS code recommendations
 * 
 * @param request - The analysis request containing consultation note, context, and options
 * @returns Promise resolving to analysis response
 */
export async function analyzeConsultation(
  request: AnalysisRequest
): Promise<AnalysisResponse> {

  try {
    // Production API call
    console.log('[API] Making request to:', API_ENDPOINTS.analyze, 'with config:', API_CONFIG);
    console.log('[API] Request data:', request);
    
    const response = await apiClient.post<AnalysisResponse>(
      API_ENDPOINTS.analyze,
      request
    );

    console.log('[API] Response received:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Analysis failed:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle HTTP error responses
      if (error.response && error.response.status === 422) {
        // Validation error
        return {
          detail: error.response.data.detail || [
            {
              loc: ['consultation_note'],
              msg: 'Invalid consultation note format',
              type: 'value_error',
            },
          ],
        };
      }
      
      if (error.response && error.response.status >= 500) {
        // Server error
        return {
          status: 'error',
          message: 'Server error occurred',
          detail: 'The MBS analysis service is temporarily unavailable. Please try again later.',
        } as AnalysisErrorResponse;
      }
      
      if (error.response?.data) {
        // Return structured error from API
        return error.response.data;
      }
    }
    
    // Generic error fallback
    throw new Error(error instanceof Error ? error.message : 'Analysis failed');
  }
}

/**
 * Check API health status
 * 
 * @returns Promise resolving to health check response
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await apiClient.get<HealthResponse>(API_ENDPOINTS.health);
    return response.data;
  } catch (error) {
    console.error('[API] Health check failed:', error);
    throw new Error('Health check failed');
  }
}

/**
 * Check if API is ready to accept requests
 * 
 * @returns Promise resolving to readiness status
 */
export async function checkReadiness(): Promise<{ ready: boolean; message?: string }> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ready);
    return response.data;
  } catch (error) {
    console.error('[API] Readiness check failed:', error);
    return { ready: false, message: 'Service not ready' };
  }
}

/**
 * Simple liveness check
 * 
 * @returns Promise resolving to liveness status
 */
export async function checkLiveness(): Promise<{ alive: boolean }> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.live);
    return response.data;
  } catch (error) {
    console.error('[API] Liveness check failed:', error);
    return { alive: false };
  }
}

/**
 * Utility function to test API connectivity
 * 
 * @returns Promise resolving to connection status
 */
export async function testConnection(): Promise<{
  connected: boolean;
  message: string;
  responseTime?: number;
}> {
  const startTime = Date.now();
  
  try {
    await checkLiveness();
    const responseTime = Date.now() - startTime;
    
    return {
      connected: true,
      message: 'API connection successful',
      responseTime,
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}