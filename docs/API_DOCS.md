# MBS-RAG API Documentation

## Base URL

**Production**: `https://mbs-rag-api-736900516853.australia-southeast1.run.app`  
**Local Development**: `http://localhost:8000`

## Authentication

Currently no authentication required. API key authentication planned for future releases.

## Rate Limiting

No rate limits currently applied. Production deployment will include rate limiting in future updates.

## CORS

The API supports CORS for the following origins:
- `http://localhost:3000` (React development)
- `http://localhost:3001` (Alternative port)
- `https://app.example.com` (Production frontend - update with your domain)

To add your domain, please submit a request to the development team.

---

## Endpoints

### 1. Analyse Consultation Note

Analyses medical consultation notes and returns relevant MBS billing code recommendations with medical reasoning.

**Endpoint**: `POST /api/v1/analyze`  
**Content-Type**: `application/json`  
**Response Time**: 
- Cached: <100ms
- Full pipeline: 6-30 seconds (includes LLM processing)

#### Request Body

```json
{
  "consultation_note": "string",
  "options": {
    "max_codes": 5,
    "min_confidence": 0.6,
    "include_reasoning": true
  }
}
```

#### Request Parameters

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `consultation_note` | string | Yes | The medical consultation text to analyse | Min: 10 chars, Max: 10,000 chars |
| `options` | object | No | Configuration options for analysis | See options table below |

#### Options Object

| Field | Type | Default | Description | Constraints |
|-------|------|---------|-------------|-------------|
| `max_codes` | integer | 5 | Maximum number of codes to return | Min: 1, Max: 10 |
| `min_confidence` | float | 0.6 | Minimum confidence threshold | Min: 0.0, Max: 1.0 |
| `include_reasoning` | boolean | true | Include detailed medical reasoning for each code | - |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "recommendations": [
    {
      "code": "23",
      "description": "Level B consultation lasting less than 20 minutes",
      "confidence": 0.85,
      "reasoning": "The 15-minute consultation for routine check-up aligns with Level B criteria...",
      "schedule_fee": 41.40,
      "category": "1"
    },
    {
      "code": "36",
      "description": "Level C consultation lasting at least 20 minutes",
      "confidence": 0.72,
      "reasoning": "Alternative option if consultation extended beyond initial estimate...",
      "schedule_fee": 79.00,
      "category": "1"
    }
  ],
  "metadata": {
    "processing_time_ms": 8543,
    "pipeline_stages": {
      "tfidf_candidates": 50,
      "embedding_candidates": 20,
      "llm_analysed": 20
    },
    "model_used": "gpt-4o-mini",
    "timestamp": "2025-08-27T10:30:45Z",
    "categorization": {
      "primary_category": 1,
      "category_name": "Professional Attendances",
      "group_focus": "A1",
      "context": "general_practice",
      "complexity": "standard",
      "confidence": 0.9,
      "reduction_percentage": 86.7
    }
  }
}
```

#### Response Fields

**recommendations** (array of objects):
- `code` (string): MBS item number
- `description` (string): Official MBS description
- `confidence` (float): Confidence score between 0.0-1.0 (display as percentage)
- `reasoning` (string): Medical justification for this code
- `schedule_fee` (float): Medicare schedule fee in AUD
- `category` (string): MBS category number

**metadata** (object):
- `processing_time_ms` (integer): Total processing time in milliseconds
- `pipeline_stages` (object): Number of candidates at each stage
- `model_used` (string): LLM model used for reasoning
- `timestamp` (string): ISO 8601 timestamp
- `categorization` (object): Details about consultation categorization
  - `primary_category` (integer): Main category identified
  - `category_name` (string): Human-readable category name
  - `group_focus` (string): Specific MBS group (e.g., "A1", "A21")
  - `context` (string): Type of consultation (e.g., "general_practice", "emergency_department", "specialist")
  - `complexity` (string): Complexity level ("brief", "standard", "long")
  - `confidence` (float): Categorization confidence
  - `reduction_percentage` (float): Percentage of codes filtered out

#### Error Responses

##### Validation Error (422 Unprocessable Entity)

```json
{
  "detail": [
    {
      "loc": ["body", "consultation_note"],
      "msg": "ensure this value has at least 10 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

##### Server Error (500 Internal Server Error)

```json
{
  "status": "error",
  "message": "Failed to process consultation note",
  "detail": "LLM service temporarily unavailable"
}
```

##### Service Unavailable (503)

When the LLM service is unavailable, the API falls back to embedding-based recommendations:

```json
{
  "detail": {
    "error": "LLM service unavailable, using fallback",
    "fallback_used": true
  }
}
```

---

### 2. Health Check

Simple health check to verify service is running.

**Endpoint**: `GET /health`  
**Response Time**: <10ms

#### Success Response (200 OK)

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "checks": {
    "mbs_codes": {
      "healthy": true,
      "message": "5964 codes loaded",
      "details": {
        "code_count": 5964,
        "categories": 9
      }
    },
    "embeddings": {
      "healthy": true,
      "message": "Embeddings model available"
    },
    "llm_provider": {
      "healthy": true,
      "message": "OpenAI provider configured"
    },
    "cache": {
      "healthy": true,
      "message": "Cache operational",
      "details": {
        "response_cache_size": 42,
        "hit_rate": 0.73
      }
    }
  },
  "uptime_seconds": 3654.2,
  "cache_stats": {
    "hits": 156,
    "misses": 58,
    "size": 42
  }
}
```

---

### 3. Readiness Check

Indicates whether the service is ready to receive traffic.

**Endpoint**: `GET /ready`  
**Response Time**: <10ms

#### Success Response (200 OK)

```json
{
  "ready": true,
  "components": {
    "mbs_codes": true,
    "embeddings": true,
    "llm": true
  }
}
```

#### Not Ready Response (503 Service Unavailable)

```json
{
  "ready": false,
  "components": {
    "mbs_codes": true,
    "embeddings": false,
    "llm": true
  },
  "message": "Service is still initializing"
}
```

---

### 4. Liveness Check

Simple check to verify the service process is alive.

**Endpoint**: `GET /live`  
**Response Time**: <5ms

#### Success Response (200 OK)

```json
{
  "alive": true
}
```

---

## Example Requests

### cURL Examples

#### Basic Analysis Request

```bash
curl -X POST "https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_note": "15-minute consultation with a 45-year-old patient for routine blood pressure check and medication review. Patient has controlled hypertension."
  }'
```

#### Request with Options

```bash
curl -X POST "https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_note": "45-minute comprehensive consultation for chronic pain management. Patient has complex medical history including diabetes, cardiac issues, and recent surgery.",
    "options": {
      "max_codes": 3,
      "min_confidence": 0.7,
      "include_reasoning": true
    }
  }'
```

#### Health Check

```bash
curl "https://mbs-rag-api-736900516853.australia-southeast1.run.app/health"
```

### JavaScript/Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mbs-rag-api-736900516853.australia-southeast1.run.app';

async function analyzeConsultation(consultationNote, options = {}) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/analyze`,
      {
        consultation_note: consultationNote,
        options: {
          max_codes: options.maxCodes || 5,
          min_confidence: options.minConfidence || 0.6,
          include_reasoning: options.includeReasoning ?? true
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35 seconds timeout
      }
    );
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'API request failed');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      throw new Error('Network error - please check your connection');
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
      throw error;
    }
  }
}

// Usage
const result = await analyzeConsultation(
  "30-minute consultation for diabetes management and foot examination",
  {
    maxCodes: 5,
    minConfidence: 0.7
  }
);

console.log(`Found ${result.recommendations.length} MBS codes`);
result.recommendations.forEach(rec => {
  console.log(`Code ${rec.code}: ${rec.description} (${Math.round(rec.confidence * 100)}% confidence)`);
  console.log(`  Fee: $${rec.schedule_fee}`);
  console.log(`  Reasoning: ${rec.reasoning}`);
});
```

### Python Example

```python
import requests
import json

API_BASE_URL = "https://mbs-rag-api-736900516853.australia-southeast1.run.app"

def analyze_consultation(consultation_note, max_codes=5, min_confidence=0.6):
    """
    Analyse a consultation note and get MBS code recommendations.
    
    Args:
        consultation_note (str): The consultation text to analyse
        max_codes (int): Maximum number of codes to return (1-10)
        min_confidence (float): Minimum confidence threshold (0.0-1.0)
    
    Returns:
        dict: API response with recommendations
    """
    url = f"{API_BASE_URL}/api/v1/analyze"
    
    payload = {
        "consultation_note": consultation_note,
        "options": {
            "max_codes": max_codes,
            "min_confidence": min_confidence,
            "include_reasoning": True
        }
    }
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=35
        )
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        raise

# Example usage
if __name__ == "__main__":
    note = """
    45-minute initial consultation with new patient presenting with 
    chronic lower back pain. Comprehensive history taken, physical 
    examination performed. Discussed treatment options including 
    physiotherapy and pain management strategies.
    """
    
    result = analyze_consultation(note, max_codes=3, min_confidence=0.7)
    
    print(f"Processing time: {result['metadata']['processing_time_ms']}ms")
    print(f"Found {len(result['recommendations'])} MBS codes:\n")
    
    for rec in result['recommendations']:
        confidence_pct = round(rec['confidence'] * 100)
        print(f"Code {rec['code']}: {rec['description']}")
        print(f"  Confidence: {confidence_pct}%")
        print(f"  Fee: ${rec['schedule_fee']:.2f}")
        print(f"  Reasoning: {rec['reasoning']}\n")
```

---

## Response Headers

All responses include the following headers:

- `X-Process-Time`: Processing time in seconds (e.g., "2.456")
- `Content-Type`: Always "application/json"
- `Access-Control-Allow-Origin`: CORS origin (when applicable)

---

## Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful request |
| 422 | Unprocessable Entity | Validation error (e.g., note too short) |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Service not ready or degraded |

---

## Performance Notes

1. **First Request**: May take 60-90 seconds if the service is cold starting
2. **Cached Responses**: Identical requests within 1 hour return cached results (<100ms)
3. **Typical Processing**: 6-30 seconds for new consultations depending on complexity
4. **Timeout**: Set your client timeout to at least 35 seconds

---

## Common Integration Patterns

### 1. Loading State Management

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

async function handleSubmit(consultationNote) {
  setLoading(true);
  setError(null);
  
  try {
    const result = await analyzeConsultation(consultationNote);
    // Handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

### 2. Retry Logic

```javascript
async function analyzeWithRetry(note, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await analyzeConsultation(note);
    } catch (error) {
      if (i === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

### 3. Response Caching (Frontend)

```javascript
const cache = new Map();

async function analyzeCached(note, options) {
  const cacheKey = JSON.stringify({ note, options });
  
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hour
      return cached.data;
    }
  }
  
  const result = await analyzeConsultation(note, options);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
```

---

## Troubleshooting

### Common Issues

1. **CORS Error**
   - Ensure your frontend domain is in the allowed origins list
   - For development, use `http://localhost:3000` or `http://localhost:3001`

2. **Timeout Error**
   - Increase client timeout to at least 35 seconds
   - First request after idle may take longer (cold start)

3. **Validation Error (422)**
   - Check consultation note is at least 10 characters
   - Ensure max_codes is between 1-10
   - Ensure min_confidence is between 0.0-1.0

4. **Empty Recommendations**
   - Lower the min_confidence threshold
   - Ensure consultation note contains medical context

---

## MBS Code Links

To link to the official MBS Online page for any code:

```javascript
function getMBSOnlineUrl(code) {
  return `https://www9.health.gov.au/mbs/fullDisplay.cfm?type=item&q=${code}&qt=item&criteria=${code}`;
}

// Example: 
// getMBSOnlineUrl("23") returns the official page for MBS item 23
```

---

## Contact & Support

For API issues, feature requests, or to request CORS domain additions:
- GitHub Issues: [mbs-rag repository](https://github.com/your-org/mbs-rag/issues)
- Email: support@mbs-rag.example.com

---

## Version History

- **v0.1.0** (Current): Initial API release with 3-stage AI pipeline
- Category-aware filtering
- LLM reasoning with GPT-4o-mini
- Response caching
- Health monitoring endpoints