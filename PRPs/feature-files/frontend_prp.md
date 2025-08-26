# React Frontend Implementation PRP

## Goal
Build a minimalist React-based web interface that allows hospital coding staff to submit consultation notes and receive MBS billing code recommendations from the existing FastAPI backend. The frontend must be testable locally with proxy configuration and deployable as static files.

## Why
- **Business Value**: Enables hospital coding staff to efficiently process consultation notes and get AI-powered MBS code suggestions with medical reasoning
- **User Impact**: Streamlines the coding workflow for non-technical hospital staff who process doctor consultation records
- **Integration**: Completes the full-stack solution by providing a user-friendly interface to the existing high-performance backend API
- **Problems Solved**: Eliminates the need for technical knowledge to interact with the API, provides visual feedback and error handling

## What
A single-page React application with:
- Simple text area for consultation note input with character counter
- Submit button that sends POST requests to `/api/v1/analyze` endpoint
- Results display showing MBS codes with confidence scores, descriptions, reasoning, and fees
- Direct links to official MBS Online pages for each code
- Loading states, error handling, and retry capabilities
- Responsive design optimized for desktop use by coding staff

### Success Criteria
- [ ] Can analyze consultation notes and display MBS recommendations locally
- [ ] Processing time under 20 seconds for typical requests
- [ ] Zero crashes in 100 test submissions
- [ ] Works offline for development without backend deployment
- [ ] Total bundle size under 500KB
- [ ] Passes accessibility tests (WCAG 2.1 Level AA)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://react.dev/reference/react-dom/components/form
  why: Official React form handling patterns and best practices
  
- url: https://www.react-hook-form.com/get-started
  why: Modern form library for validation and state management
  
- url: https://vitejs.dev/guide/
  why: Vite setup and configuration for React projects (2024 recommended over CRA)
  
- url: https://fastapi.tiangolo.com/tutorial/cors/
  why: CORS configuration for FastAPI-React integration
  
- file: src/api/models.py
  why: Exact API request/response structure and validation rules
  
- file: src/api/routes.py  
  why: API endpoint details, error codes, and response format
  
- file: tests/conftest.py
  why: Testing patterns and fixture structure to mirror in frontend tests
  
- file: docs/frontend-requirements.md
  why: Complete functional and technical requirements specification

- url: https://testing-library.com/docs/react-testing-library/intro/
  why: React component testing best practices
```

### Current Codebase Tree
```bash
mbs-rag/
├── src/api/                   # FastAPI backend (EXISTING)
│   ├── main.py               # FastAPI app setup
│   ├── routes.py             # /api/v1/analyze endpoint
│   ├── models.py             # Pydantic request/response models
│   └── middleware.py         # CORS configuration
├── tests/                    # Backend test suite (EXISTING)
├── docs/                     # Documentation (EXISTING)
├── pyproject.toml           # Python dependencies (EXISTING)
└── README.md                # Project overview (EXISTING)
```

### Desired Codebase Tree
```bash
mbs-rag/
├── src/api/                  # FastAPI backend (EXISTING)
├── frontend/                 # NEW: React application
│   ├── package.json          # Dependencies (Vite, React, React Hook Form)
│   ├── vite.config.js        # Vite configuration with proxy
│   ├── index.html            # Entry point
│   ├── src/
│   │   ├── main.jsx          # React app bootstrap
│   │   ├── App.jsx           # Main application component
│   │   ├── components/
│   │   │   ├── ConsultationInput.jsx    # Note input form
│   │   │   ├── ResultsDisplay.jsx       # MBS code results
│   │   │   ├── CodeCard.jsx            # Individual code display
│   │   │   └── LoadingSpinner.jsx      # Loading state
│   │   ├── services/
│   │   │   └── api.js        # API integration layer
│   │   ├── hooks/
│   │   │   └── useAnalysis.js # Custom hook for API calls
│   │   └── styles/
│   │       └── index.css     # Minimal styling
│   └── __tests__/
│       ├── App.test.jsx      # Integration tests
│       ├── components/       # Component unit tests
│       └── services/         # API service tests
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: Backend uses Pydantic models with specific field names
// API expects "consultation_note" not "note" or "consultationNote"
const requestPayload = {
  consultation_note: note,  // ✅ Correct field name
  options: {
    max_codes: 5,
    min_confidence: 0.6,
    include_reasoning: true
  }
}

// CRITICAL: Response structure uses "recommendations" array
const response = data.recommendations; // ✅ Not "codes" or "results"

// CRITICAL: Confidence is float 0.0-1.0, display as percentage
const displayConfidence = Math.round(rec.confidence * 100); // ✅

// GOTCHA: Vite proxy requires exact path matching
// vite.config.js proxy target must include /api/v1
'/api': {
  target: 'http://localhost:8000',
  changeOrigin: true
}

// CRITICAL: FastAPI CORS middleware already configured for localhost:5173
// No additional CORS handling needed in frontend

// GOTCHA: MBS Online links must include protocol
const mbsUrl = `https://www9.health.gov.au/mbs/fullDisplay.cfm?type=item&q=${code}&qt=item&criteria=${code}`;
```

## Implementation Blueprint

### Data Models and Structure
```javascript
// Mirror backend Pydantic models for type safety
export const analysisRequestSchema = {
  consultation_note: {
    type: 'string',
    minLength: 10,
    maxLength: 10000,
    required: true
  },
  options: {
    max_codes: { type: 'number', default: 5, min: 1, max: 10 },
    min_confidence: { type: 'number', default: 0.6, min: 0.0, max: 1.0 },
    include_reasoning: { type: 'boolean', default: true }
  }
}

// Response structure
export interface CodeRecommendation {
  code: string;
  description: string;
  confidence: number; // 0.0-1.0
  reasoning: string;
  schedule_fee: number;
  category: string | null;
}

export interface AnalysisResponse {
  status: string; // "success" 
  recommendations: CodeRecommendation[];
  metadata: {
    processing_time_ms: number;
    pipeline_stages: Record<string, number>;
    model_used: string;
    timestamp: string;
  };
}
```

### List of Tasks (In Order)
```yaml
Task 1 - Project Setup:
CREATE frontend/package.json:
  - USE Vite as build tool (not Create React App - 2024 best practice)
  - DEPENDENCIES: react, react-dom, react-hook-form, axios
  - DEV_DEPENDENCIES: vite, @vitejs/plugin-react, vitest, @testing-library/react

Task 2 - Vite Configuration:
CREATE frontend/vite.config.js:
  - CONFIGURE proxy to forward /api requests to localhost:8000
  - ENABLE React plugin
  - SET port to 5173 (matches backend CORS settings)

Task 3 - API Service Layer:
CREATE frontend/src/services/api.js:
  - IMPLEMENT POST to /api/v1/analyze
  - HANDLE request/response transformation
  - INCLUDE error handling with retry logic
  - PATTERN: Mirror backend error response structure

Task 4 - Core Components:
CREATE frontend/src/components/ConsultationInput.jsx:
  - USE react-hook-form for validation
  - VALIDATE 10-10000 character limit (matches backend)
  - INCLUDE character counter
  - DEBOUNCE submission to prevent double-clicks

Task 5 - Results Display:
CREATE frontend/src/components/ResultsDisplay.jsx:
  - DISPLAY recommendations array from API response
  - SORT by confidence (highest first)
  - SHOW loading states during API calls

Task 6 - Code Cards:
CREATE frontend/src/components/CodeCard.jsx:
  - DISPLAY code, description, confidence as percentage
  - INCLUDE medical reasoning text
  - ADD MBS Online link with target="_blank"
  - STYLE with confidence-based color coding

Task 7 - Main App Integration:
MODIFY frontend/src/App.jsx:
  - COMBINE all components
  - IMPLEMENT error boundaries
  - HANDLE API state management

Task 8 - Testing Suite:
CREATE frontend/__tests__/:
  - UNIT tests for each component
  - INTEGRATION test for full workflow
  - MOCK API responses (mirror backend fixtures)
  - PATTERN: Use React Testing Library (not Enzyme)
```

### Per Task Pseudocode

```javascript
// Task 3 - API Service
export const analyzeConsultation = async (consultationNote, options = {}) => {
  // PATTERN: Validate input client-side before API call
  if (!consultationNote?.trim() || consultationNote.length < 10) {
    throw new Error('Consultation note must be at least 10 characters');
  }
  
  // CRITICAL: Use exact field names from backend models
  const payload = {
    consultation_note: consultationNote.trim(),
    options: {
      max_codes: options.maxCodes || 5,
      min_confidence: options.minConfidence || 0.6,
      include_reasoning: options.includeReasoning ?? true
    }
  };
  
  // GOTCHA: Axios timeout should be 30s to match backend processing
  const response = await axios.post('/api/v1/analyze', payload, {
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // PATTERN: Transform response to match frontend needs
  return {
    success: response.data.status === 'success',
    recommendations: response.data.recommendations || [],
    processingTime: response.data.metadata?.processing_time_ms,
    error: null
  };
};

// Task 4 - Form Component with React Hook Form
const ConsultationInput = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { consultation_note: '' }
  });
  
  const note = watch('consultation_note');
  const charCount = note?.length || 0;
  
  // PATTERN: Debounce submission to prevent double-clicks
  const debouncedSubmit = useCallback(
    debounce((data) => onSubmit(data.consultation_note), 500),
    [onSubmit]
  );
  
  return (
    <form onSubmit={handleSubmit(debouncedSubmit)}>
      <textarea
        {...register('consultation_note', {
          required: 'Consultation note is required',
          minLength: { value: 10, message: 'Minimum 10 characters' },
          maxLength: { value: 10000, message: 'Maximum 10,000 characters' }
        })}
        placeholder="Enter consultation note here..."
        disabled={isLoading}
      />
      <div>Characters: {charCount}/10,000</div>
      {errors.consultation_note && <span>{errors.consultation_note.message}</span>}
      <button type="submit" disabled={isLoading || charCount < 10}>
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};
```

### Integration Points
```yaml
VITE_PROXY:
  - config: "frontend/vite.config.js"
  - pattern: "proxy: { '/api': { target: 'http://localhost:8000' } }"
  
STYLING:
  - framework: "None (vanilla CSS for simplicity)"
  - pattern: "CSS custom properties for theming"
  - responsive: "CSS Grid and Flexbox"
  
DEPLOYMENT:
  - build: "npm run build -> frontend/dist/"
  - serve: "Static files can be served by any web server"
  - production: "Set VITE_API_BASE_URL environment variable"
```

## Validation Loop

### Level 1: Setup & Dependencies
```bash
# Initialize project
cd frontend
npm create vite@latest . -- --template react
npm install react-hook-form axios

# Expected: Clean installation with no peer dependency warnings
# If errors: Resolve version conflicts, ensure Node.js 18+
```

### Level 2: Development Server
```bash
# Start both services
cd backend && uv run uvicorn src.api.main:app --reload --port 8000 &
cd frontend && npm run dev

# Test proxy configuration
curl -X POST "http://localhost:5173/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{"consultation_note": "Test consultation note for proxy"}'

# Expected: Response from backend API through proxy
# If CORS error: Check FastAPI middleware configuration
# If 404: Verify proxy path configuration in vite.config.js
```

### Level 3: Unit Tests
```javascript
// CREATE __tests__/components/ConsultationInput.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsultationInput from '../components/ConsultationInput';

test('validates minimum character length', async () => {
  const mockSubmit = jest.fn();
  render(<ConsultationInput onSubmit={mockSubmit} />);
  
  const textarea = screen.getByPlaceholderText(/consultation note/i);
  const submitBtn = screen.getByText(/analyze/i);
  
  fireEvent.change(textarea, { target: { value: 'Short' } });
  fireEvent.click(submitBtn);
  
  await waitFor(() => {
    expect(screen.getByText(/minimum 10 characters/i)).toBeInTheDocument();
  });
  expect(mockSubmit).not.toHaveBeenCalled();
});

test('submits valid consultation note', async () => {
  const mockSubmit = jest.fn();
  const validNote = 'This is a valid consultation note with sufficient length';
  
  render(<ConsultationInput onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByPlaceholderText(/consultation note/i), {
    target: { value: validNote }
  });
  fireEvent.click(screen.getByText(/analyze/i));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(validNote);
  });
});
```

```bash
# Run tests
npm test

# Expected: All tests pass
# If failing: Check component imports, mock configurations
```

### Level 4: Integration Test
```bash
# Start development server
npm run dev

# Manual test in browser
open http://localhost:5173

# Test full workflow:
# 1. Enter consultation note (>10 characters)
# 2. Click "Analyze" button  
# 3. Verify loading state appears
# 4. Verify results display with MBS codes
# 5. Click MBS Online link (opens in new tab)
# 6. Test error scenarios (empty input, network error)

# Expected: Complete workflow functions without JavaScript errors
# Check browser dev tools for console errors
```

## Final Validation Checklist
- [ ] Frontend starts: `npm run dev` (http://localhost:5173)
- [ ] Backend proxy works: Test API call through frontend
- [ ] All unit tests pass: `npm test`
- [ ] Form validation works: Try invalid inputs
- [ ] Loading states display: Submit and observe UI
- [ ] Results render correctly: Valid submission shows MBS codes
- [ ] Error handling works: Test network failures
- [ ] MBS links work: Click links open correct pages
- [ ] Responsive design: Test mobile and desktop views
- [ ] Build succeeds: `npm run build` creates dist/ folder
- [ ] No console errors: Check browser dev tools

## Anti-Patterns to Avoid
- ❌ Don't use Create React App (deprecated in 2024)
- ❌ Don't bypass form validation - always validate client and server side
- ❌ Don't ignore loading states - users need feedback during API calls
- ❌ Don't hardcode API URLs - use environment variables
- ❌ Don't use class components - stick to functional components with hooks
- ❌ Don't skip error boundaries - gracefully handle component crashes
- ❌ Don't use inline styles - use CSS classes for maintainability
- ❌ Don't forget accessibility - include proper ARIA labels and keyboard navigation

---

**Confidence Score: 9/10** - This PRP provides comprehensive context including exact API structure from the codebase, modern React patterns, specific gotchas, and executable validation steps. The implementation should succeed in one pass with iterative refinement through the validation loops.