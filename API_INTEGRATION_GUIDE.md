# API Integration Guide for Real Data Collection

This guide shows how to enable real data collection from API endpoints in the MBS Frontend Dashboard.

## 🔄 Current Architecture

The dashboard is **API-ready** with mock data fallbacks. All services have commented API calls that can be easily enabled.

## 📡 API Endpoint Requirements

### 1. **Metrics API Endpoints**

#### GET `/api/metrics/kpis`
Returns current KPI metrics:
```json
{
  "kpis": [
    {
      "id": "accuracy",
      "title": "Analysis Accuracy", 
      "value": "96.2%",
      "change": {
        "value": 2.3,
        "type": "increase",
        "period": "last week"
      },
      "icon": "🎯",
      "color": "green",
      "target": 98,
      "trend": [
        {"date": "2024-01-01", "value": 95.1},
        {"date": "2024-01-02", "value": 95.8}
      ]
    }
  ]
}
```

#### GET `/api/system/status`
Returns system health status:
```json
{
  "status": "healthy",
  "uptime": 99.97,
  "lastUpdate": "2024-01-15T10:30:00Z",
  "services": {
    "api": "online",
    "database": "online", 
    "cache": "online"
  }
}
```

### 2. **Activity API Endpoints**

#### POST `/api/activities`
Returns filtered activity data:
```json
{
  "activities": [
    {
      "id": "act_123",
      "timestamp": "2024-01-15T10:30:00Z",
      "action": "Analysis completed",
      "description": "Processed consultation for Patient #P-4789",
      "status": "success",
      "user": "Dr. Smith",
      "metadata": {
        "processingTime": 1.2,
        "codeCount": 3,
        "confidence": 0.96
      }
    }
  ],
  "pagination": {
    "total": 1540,
    "page": 1,
    "limit": 10
  }
}
```

#### GET `/api/activities/stats`
Returns activity statistics:
```json
{
  "total": 15234,
  "success": 14890,
  "warning": 234,
  "error": 110,
  "todayCount": 89,
  "averageProcessingTime": 1.24
}
```

### 3. **Analytics API Endpoints**

#### GET `/api/analytics/performance`
Returns performance analytics data:
```json
{
  "timeRange": "30d",
  "accuracyTrend": [
    {"label": "Jan 1", "value": 95.2},
    {"label": "Jan 2", "value": 96.1}
  ],
  "processingTimeTrend": [
    {"label": "Jan 1", "value": 1.3},
    {"label": "Jan 2", "value": 1.2}
  ],
  "volumeByContext": [
    {"label": "General Practice", "value": 2543},
    {"label": "Specialist", "value": 1876}
  ]
}
```

## 🛠 Implementation Steps

### Step 1: Environment Configuration

Create `.env` file:
```bash
VITE_API_URL=https://your-api-domain.com
VITE_API_KEY=your-api-key-here
VITE_ENABLE_REAL_API=true
```

### Step 2: Enable Real API Calls

#### In `metricsService.ts`:
```typescript
async getKPIData(): Promise<KPIData[]> {
  try {
    if (import.meta.env.VITE_ENABLE_REAL_API === 'true') {
      // ENABLE THIS SECTION:
      const response = await fetch(`${this.baseUrl}/api/metrics/kpis`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.kpis;
    }
    
    // Fallback to mock data
    return this.getMockKPIData();
  } catch (error) {
    console.error('Failed to fetch KPI data:', error);
    // Graceful degradation - return mock data on API failure
    return this.getMockKPIData();
  }
}
```

#### In `activityService.ts`:
```typescript
async getActivities(filters?: ActivityFilters): Promise<ActivityItem[]> {
  try {
    if (import.meta.env.VITE_ENABLE_REAL_API === 'true') {
      // ENABLE THIS SECTION:
      const response = await fetch(`${this.baseUrl}/api/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.activities;
    }
    
    // Fallback to mock data
    return this.getFilteredMockData(filters);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    // Graceful degradation
    return this.getFilteredMockData(filters);
  }
}
```

### Step 3: Enhanced Error Handling

Create `src/services/apiClient.ts`:
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return { 
        data: null as T, 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const apiClient = new ApiClient();
```

### Step 4: Real-time Data Integration

#### WebSocket Support (Optional):
```typescript
// In metricsService.ts
private initializeWebSocket() {
  if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'kpi_update') {
        this.subscribers.forEach(callback => callback(data.kpis));
      }
    };
  }
}
```

## 🔧 Configuration Options

### Development vs Production
```typescript
// Development: Use mock data with realistic delays
const isDevelopment = import.meta.env.DEV;
const useRealApi = import.meta.env.VITE_ENABLE_REAL_API === 'true';

if (!isDevelopment && useRealApi) {
  // Production API calls
} else {
  // Mock data with optional delays for realistic testing
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData;
}
```

### Hybrid Approach
```typescript
// Combine real and mock data for development
async getKPIData(): Promise<KPIData[]> {
  try {
    // Try real API first
    if (useRealApi) {
      const realData = await this.fetchRealKPIData();
      if (realData.success) {
        return realData.data;
      }
    }
    
    // Fallback to enhanced mock data
    console.log('Using mock data fallback');
    return this.getMockKPIData();
  } catch (error) {
    // Always have a fallback
    return this.getMockKPIData();
  }
}
```

## 📊 Data Collection Features

### 1. **Automatic Retry Logic**
```typescript
async fetchWithRetry<T>(url: string, options: RequestInit, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 2. **Caching Strategy**
```typescript
private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

async getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  
  const data = await fetcher();
  this.cache.set(key, { data, timestamp: Date.now(), ttl });
  return data;
}
```

### 3. **Performance Monitoring**
```typescript
async fetchKPIData(): Promise<KPIData[]> {
  const startTime = performance.now();
  
  try {
    const data = await this.apiRequest('/api/metrics/kpis');
    const endTime = performance.now();
    
    console.log(`KPI fetch took ${endTime - startTime} milliseconds`);
    return data;
  } catch (error) {
    console.error('KPI fetch failed:', error);
    throw error;
  }
}
```

## 🚀 Quick Start

1. **Set environment variables**:
   ```bash
   VITE_API_URL=https://your-api.com
   VITE_API_KEY=your-key
   VITE_ENABLE_REAL_API=true
   ```

2. **Uncomment API calls** in services
3. **Test with fallbacks** enabled
4. **Monitor network tab** for API calls
5. **Verify error handling** works correctly

The dashboard will automatically switch between real and mock data based on configuration, ensuring a robust user experience regardless of API availability!