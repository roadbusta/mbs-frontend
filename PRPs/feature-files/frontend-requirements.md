# Frontend User Requirements Document

## Executive Summary
A minimalist React-based web interface for medical coding staff to submit consultation notes and receive MBS billing code recommendations from the existing backend API.

## Target Users
- **Primary**: Hospital coding department staff
- **Secondary**: Medical administrative staff
- **Note**: Doctors typically do not perform coding themselves

## Core Functional Requirements

### 1. Consultation Note Input
- **Single text area** for pasting or typing consultation notes
- **Character counter** to show input length
- **Clear button** to reset the input field
- **Example button** to load a sample consultation note for testing

### 2. Submit and Process
- **Analyze button** to send the consultation note to the API
- **Loading state** with spinner during API processing (typical: 2-15 seconds)
- **Cancel button** to abort long-running requests

### 3. Results Display
- **MBS Code Cards** showing for each recommended code:
  - Item number (e.g., 5012)
  - Description
  - Confidence percentage with visual indicator (bar or color)
  - Medical reasoning explanation
  - Schedule fee amount
  - **MBS Online link** - Opens official MBS page in new tab (format: `https://www9.health.gov.au/mbs/fullDisplay.cfm?type=item&q={code}&qt=item&criteria={code}`)
- **Sort by confidence** (highest first)
- **Copy button** for each code number

### 4. Error Handling
- **Connection error** message if API is unreachable
- **Timeout message** after 30 seconds
- **Retry button** to resubmit failed requests

## Technical Requirements

### Local Development Setup
- **Proxy configuration** in package.json to forward API calls:
  ```json
  "proxy": "http://localhost:8000"
  ```
- **Environment variable** for API endpoint (development vs production)
- **CORS handling** for local testing

### API Integration
- **Single endpoint**: `POST /api/v1/analyze`
- **Request format**:
  ```json
  {
    "consultation_note": "string",
    "options": {
      "max_codes": 5,
      "min_confidence": 0.6
    }
  }
  ```
- **Response format**:
  ```json
  {
    "success": true,
    "recommended_codes": [
      {
        "code": "5012",
        "description": "Professional attendance by a general practitioner...",
        "confidence": 0.85,
        "reasoning": "The consultation involved a 45-minute comprehensive assessment...",
        "schedule_fee": 79.15,
        "benefit_75": 59.40,
        "benefit_85": 67.30,
        "category": "1",
        "group": "A1"
      }
    ],
    "processing_time": 2.34,
    "pipeline_metrics": {
      "tfidf_candidates": 50,
      "embedding_candidates": 20,
      "final_recommendations": 3
    },
    "timestamp": "2025-01-26T10:30:45Z"
  }
  ```
- **Error response format**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Failed to process consultation note",
      "code": "PROCESSING_ERROR",
      "details": "LLM service unavailable"
    }
  }
  ```

### Performance Requirements
- **Response caching** in browser for repeated queries
- **Debounced input** to prevent accidental submissions
- **Maximum note length**: 10,000 characters

## UI/UX Requirements

### Visual Design
- **Clean, clinical aesthetic** with plenty of whitespace
- **High contrast** for accessibility
- **Mobile responsive** but optimized for desktop use
- **Sans-serif font** for readability

### Layout
- **Two-panel design**:
  - Left: Input area (40% width)
  - Right: Results area (60% width)
- **Sticky header** with application title
- **No navigation menu** (single page application)

### Colors
- Primary: Medical blue (#0066CC)
- Success: Green (#28A745)
- Warning: Amber (#FFC107)
- Error: Red (#DC3545)
- Background: Light gray (#F8F9FA)

## Non-Functional Requirements

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible

### Security
- Input sanitization (prevent XSS)
- HTTPS only in production
- No client-side storage of sensitive data

## Out of Scope
- User authentication/login
- Result history/saving
- Multiple consultation batch processing
- PDF export
- Admin panel
- User preferences/settings
- Feedback mechanism
- Analytics tracking

## Development Milestones

### Phase 1: MVP (Week 1)
- Basic input/output functionality
- API integration
- Error handling
- Loading states

### Phase 2: Polish (Week 2)
- Responsive design
- Accessibility improvements
- Performance optimization
- Production deployment configuration

## Testing Requirements

### Local Testing
- Mock API responses for offline development
- Example consultation notes provided
- Error simulation capabilities

### Test Coverage
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical user flows

## File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ConsultationInput.jsx
│   │   ├── ResultsDisplay.jsx
│   │   ├── CodeCard.jsx
│   │   └── LoadingSpinner.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── helpers.js
│   ├── App.jsx
│   └── index.js
├── public/
├── package.json
└── README.md
```

## Success Metrics
- Time to first result < 20 seconds
- Zero crashes in 1000 submissions
- Works without modification on local development
- Total bundle size < 500KB

## Deployment
- Static build output
- Environment variable for API endpoint
- Can be served from any static hosting service
- No server-side rendering required