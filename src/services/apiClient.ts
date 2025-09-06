/**
 * API Client for Real Data Integration
 * 
 * Centralized API client with error handling, retries, and caching.
 * Provides seamless integration between mock and real data sources.
 */

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  status?: number;
}

interface RequestOptions extends Omit<RequestInit, 'cache'> {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  /**
   * Check if real API is enabled
   */
  get isRealApiEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_REAL_API === 'true' && !!this.baseUrl && !!this.apiKey;
  }

  /**
   * Make API request with comprehensive error handling
   */
  async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = 10000,
      retries = 2,
      cache = false,
      cacheTTL = 300000, // 5 minutes
      ...fetchOptions
    } = options;

    // Check cache first
    if (cache) {
      const cacheKey = `${endpoint}-${JSON.stringify(fetchOptions)}`;
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        return { data: cached, success: true };
      }
    }

    // Make request with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...fetchOptions.headers
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: T = await response.json();

        // Cache successful response
        if (cache) {
          const cacheKey = `${endpoint}-${JSON.stringify(fetchOptions)}`;
          this.setCachedData(cacheKey, data, cacheTTL);
        }

        return { 
          data, 
          success: true, 
          status: response.status 
        };

      } catch (error) {
        console.warn(`API request attempt ${attempt + 1} failed for ${endpoint}:`, error);
        
        // If this was the last attempt, return error
        if (attempt === retries) {
          return { 
            data: null as T, 
            success: false, 
            message: error instanceof Error ? error.message : 'Unknown API error',
            status: error instanceof Error && 'status' in error ? (error as any).status : 0
          };
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // This should never be reached, but TypeScript requires it
    return { 
      data: null as T, 
      success: false, 
      message: 'Maximum retries exceeded' 
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get cached data
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  /**
   * Set cached data
   */
  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { 
        timeout: 5000, 
        retries: 1 
      });
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }> {
    if (!this.isRealApiEnabled) {
      return {
        connected: false,
        latency: 0,
        error: 'Real API not enabled or configured'
      };
    }

    const startTime = performance.now();
    
    try {
      const health = await this.healthCheck();
      const latency = performance.now() - startTime;
      
      return {
        connected: health,
        latency: Math.round(latency),
        error: health ? undefined : 'Health check failed'
      };
    } catch (error) {
      return {
        connected: false,
        latency: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Utility function for easy API state checking
export const useRealApi = () => apiClient.isRealApiEnabled;