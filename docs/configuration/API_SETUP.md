# API Configuration & Setup Guide

## 🔗 API Connection Status: WORKING ✅

The MBS Coding Assistant frontend is **successfully connected** to the production backend API and fully operational.

## 📡 API Endpoints

### Production Backend
- **Base URL**: `https://mbs-rag-api-736900516853.australia-southeast1.run.app`
- **Platform**: Google Cloud Run
- **Status**: ✅ Operational
- **Model**: GPT-4o-mini for MBS analysis
- **Database**: 5,964 current MBS codes

### Available Endpoints
```typescript
const API_ENDPOINTS = {
  analyze: '/api/v1/analyze',         // Main MBS analysis endpoint
  health: '/health',                  // Service health check
  ready: '/ready',                    // Readiness probe  
  live: '/live'                       // Liveness probe
};
```

## ⚙️ Configuration Setup

### Environment Variables
Located in `.env` file:
```bash
# Production API endpoint (current default)
VITE_API_BASE_URL=https://mbs-rag-api-736900516853.australia-southeast1.run.app

# For local development backend (uncomment if needed)
# VITE_API_BASE_URL=http://localhost:8000
```

### Development Proxy (Vite)
Located in `vite.config.ts`:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app',
      changeOrigin: true,
      secure: true,
    },
    '/health': { /* same config */ },
    '/ready': { /* same config */ }, 
    '/live': { /* same config */ }
  }
}
```

### API Service Configuration  
Located in `src/services/apiService.ts`:
```typescript
const API_CONFIG = {
  timeout: 35000,                     // 35 second timeout
  baseURL: import.meta.env.PROD 
    ? import.meta.env.VITE_API_BASE_URL 
    : '',                            // Use proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
};
```

## 🚀 Local Development Setup

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd mbs-frontend

# Install dependencies  
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173/
```

### Development vs Production
- **Development**: Uses Vite proxy to handle CORS
- **Production**: Direct API calls to backend URL
- **Environment**: Automatically detected by `import.meta.env.PROD`

## 🔍 API Testing & Verification

### Health Check Test
```bash
curl http://localhost:5173/health
```
**Expected Response**: JSON with service health status

### Analysis Endpoint Test  
```bash
curl -X POST "http://localhost:5173/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_note": "Patient presented with chest pain. Consultation duration 25 minutes.",
    "context": "general_practice",
    "options": {
      "max_codes": 3,
      "include_reasoning": true
    }
  }'
```
**Expected Response**: JSON with MBS code recommendations

## 📊 API Request/Response Examples

### Request Structure
```typescript
interface AnalysisRequest {
  consultation_note: string;          // Required: consultation text
  context?: ConsultationContext;      // Optional: consultation type
  options?: {
    max_codes?: number;               // Default: 5
    min_confidence?: number;          // Default: 0.6  
    include_reasoning?: boolean;      // Default: true
  };
}
```

### Response Structure
```typescript
interface AnalysisSuccessResponse {
  status: 'success';
  recommendations: CodeRecommendation[];
  metadata: ProcessingMetadata;
}

interface CodeRecommendation {
  code: string;                       // MBS item number
  description: string;                // Official MBS description
  confidence: number;                 // AI confidence (0.0-1.0)
  reasoning?: string;                 // AI explanation
  schedule_fee: number;               // Fee in AUD
  category?: string;                  // MBS category
  evidence_spans?: EvidenceSpan[];    // Text highlighting data
}
```

## ⚡ Performance Characteristics

### Response Times
- **Health Check**: < 1 second
- **Analysis Request**: 6-30 seconds (AI processing)
- **Network Latency**: < 500ms (Google Cloud Run)

### Request Limits
- **Timeout**: 35 seconds maximum
- **Text Length**: 10,000 characters maximum  
- **Rate Limiting**: Handled by backend (Google Cloud Run)

## 🔧 Troubleshooting

### Common Issues & Solutions

**Issue: Blank page after starting dev server**
- **Solution**: Check browser console for TypeScript errors
- **Fix**: Run `npm run build` to identify compilation issues

**Issue: API requests failing**
- **Solution**: Verify `.env` file exists with correct API URL
- **Fix**: Test direct API connection: `curl https://mbs-rag-api-736900516853.australia-southeast1.run.app/health`

**Issue: CORS errors in development**
- **Solution**: Ensure Vite proxy is configured correctly
- **Fix**: Check `vite.config.ts` proxy settings match API base URL

**Issue: Long loading times**
- **Solution**: Normal for AI analysis (6-30 seconds)
- **Fix**: Wait for completion, check loading spinner

### Debug Mode
Enable request/response logging in browser console:
```typescript
// Already enabled in apiService.ts
console.log('[API] Request:', request);
console.log('[API] Response:', response);
```

## 🔒 Security Considerations

### HTTPS Enforcement
- ✅ Production API uses HTTPS
- ✅ Development proxy handles secure connections
- ✅ No sensitive data in frontend code

### Environment Variables
- ✅ API URL in environment variables (not hardcoded)
- ✅ No API keys required for current setup
- ✅ CORS handled by proxy configuration

## 🚀 Deployment Configuration

### For Vercel Deployment
Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/$1"
    },
    {
      "source": "/health",  
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/health"
    }
  ]
}
```

### Environment Variables in Deployment
Set in deployment platform:
```bash
VITE_API_BASE_URL=https://mbs-rag-api-736900516853.australia-southeast1.run.app
```

---

## 🚧 Current Status Summary

- **API Connection**: ✅ Working in development environment
- **Development Setup**: ✅ Configured and functional  
- **Testing Phase**: 🚧 Undergoing iterative testing
- **Error Handling**: ✅ Basic coverage implemented
- **Documentation**: ✅ Development documentation complete

The API integration is **functional for development** and currently undergoing testing and refinement.

---

*Configuration guide updated: 2025-08-27*