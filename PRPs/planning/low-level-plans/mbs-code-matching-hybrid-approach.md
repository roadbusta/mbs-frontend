# MBS Code Matching - Hybrid Approach (33-Hour Development Plan)

## Complete Hour-by-Hour Schedule

### Phase 1: Core Pipeline (Hours 1-4) ✅
- **Hour 1**: Data Foundation - Parse MBS XML, create JSON cache ✅
- **Hour 2**: Basic Matcher - TF-IDF text filtering ✅
- **Hour 3**: Embedding Layer - Semantic similarity ranking ✅
- **Hour 4**: LLM Reasoning - OpenAI integration with fallback ✅

### Phase 1.5: API Development (Hours 5-7) ✅
- **Hour 5**: FastAPI Implementation - Create REST endpoints ✅
- **Hour 6**: Production Optimizations - Caching, error handling ✅
- **Hour 7**: Testing & Documentation - Integration tests, API docs ✅

### Phase 1.6: Deployment (Hours 8-10) ✅
- **Hour 8**: Containerization - Docker, Gunicorn setup ✅
- **Hour 9**: Cloud Deployment - Google Cloud Run configuration ✅
- **Hour 10**: Production Verification - End-to-end testing ✅

### Phase 1.7: Accuracy Improvements (Hours 11-13) 🚧 CURRENT PRIORITY
- **Hour 11**: Enhanced Data Extraction - Capture all MBS XML fields
- **Hour 12**: Improved Matching Logic - Category-aware filtering
- **Hour 13**: Prompt Engineering - Medical context and rules

### Phase 2: Frontend (Hours 14-18)
- **Hour 14**: React Setup - Project structure, TypeScript, Tailwind
- **Hour 15**: Input Interface - Consultation notes entry
- **Hour 16**: Results Display - MBS codes with reasoning
- **Hour 17**: Feedback UI - Thumbs up/down, detailed feedback
- **Hour 18**: Integration & Deploy - Connect to API, deploy to Vercel

### Phase 3: Enhanced Processing (Hours 19-23)
- **Hour 19**: Additional Notes Research - Understand AN structure
- **Hour 20**: Database Setup - PostgreSQL for feedback storage
- **Hour 21**: Feedback API - Endpoints for storing feedback
- **Hour 22**: AN Processing - Enhance LLM with Additional Notes
- **Hour 23**: Caching Layer - Redis for result caching

### Phase 4: Production Hardening (Hours 24-28)
- **Hour 24**: Authentication - API keys, user management
- **Hour 25**: Rate Limiting - Prevent abuse, manage costs
- **Hour 26**: Monitoring - Dashboards, metrics, alerts
- **Hour 27**: Queue System - Handle high load, batch processing
- **Hour 28**: Performance Tuning - Optimize for scale

### Phase 5: Offline Capability (Hours 29-33)
- **Hour 29**: Local LLM Research - Ollama, llama.cpp evaluation
- **Hour 30**: Offline Model Setup - Local inference implementation
- **Hour 31**: Hybrid Logic - Online/offline switching
- **Hour 32**: Desktop Packaging - Electron or similar
- **Hour 33**: Sync Mechanism - Offline/online data reconciliation

## Overview
A pragmatic multi-stage approach for matching doctor's consultation notes with MBS billing codes, built iteratively from MVP to production-ready system.

## Current Status & Priority Rationale

### Why Category Pre-filtering is Critical (Hour 11)

The system currently searches all 6,000 codes indiscriminately, causing fundamental accuracy issues:

1. **Wrong Code Categories**: Recommends imaging codes (Category 5) for consultations (should be Category 1)
2. **Massive Search Space**: Searching 6,000 codes when only ~600-1,500 are relevant
3. **No Context Awareness**: Doesn't understand emergency vs GP vs specialist contexts

**The Solution - Intelligent Pre-filtering**:
- Use LLM to categorize the consultation note FIRST
- Reduce search space by 75-90% (from 6,000 to relevant subset)
- Ensure we only look in appropriate categories:
  - Category 1: Professional Attendances (consultations)
  - Category 3: Therapeutic Procedures (if procedures detected)
  - EXCLUDE Categories 5 & 6 (imaging/pathology) from primary billing

### Pipeline Enhancement Flow

```
Current (Broken):
Note → Search ALL 6,000 codes → Often wrong category

New (Smart):
Note → LLM Categorizer → Search only 600-1,500 relevant codes → Correct category
         ↓
    Determines:
    - Primary: Category 1 (consultation)
    - Additional: Category 3 (if procedures)
    - Context: Emergency/GP/Specialist
    - Complexity: Ordinary/High
```

**Impact**: This single change will prevent the fundamental error of recommending imaging/pathology codes as consultation codes, while also making the system faster and more accurate.

### Revised Implementation Priority

The categorization approach fundamentally changes the accuracy improvement strategy:

#### **Hour 11: LLM-Based Category Pre-filtering** (HIGHEST PRIORITY)
- Foundation for all other improvements
- Provides biggest accuracy gain (eliminates wrong category errors)
- Reduces search space by 75-90%
- Enables context-aware processing

#### **Hour 12: Enhanced Data Extraction** 
- Builds on categorization with richer data
- Adds fields needed for category-aware filtering
- Creates indexes for fast category-based lookups

#### **Hour 13: Improved Category-Aware Matching**
- Integrates categorization throughout pipeline
- Implements smart filtering rules
- Enhances scoring with category context

### Key Benefits

1. **Massive Accuracy Improvement**: Filtering to right category eliminates core issue
2. **Performance Boost**: 75-90% search space reduction
3. **Context Awareness**: Emergency vs GP vs specialist understanding
4. **Prevents Billing Errors**: Never recommends imaging/pathology as primary codes

## Why Not Pure RAG/Vector DB?
- **Setup Complexity**: 3-4 hours just for infrastructure
- **Risk**: Vector DB issues could derail entire demo
- **Overkill**: For ~200-300 codes, simpler approaches work well
- **Time Constraint**: Only 5 hours available for Phase 1 MVP

## MBS Category Definitions (From MBS Book Analysis)

### Categories and Their Usage
```
Category 1: Professional Attendances (658 codes)
  - ALWAYS include for consultations
  - Groups: A1 (GP), A3 (Specialist), A21 (Emergency), etc.
  
Category 2: Diagnostic Procedures and Investigations (485 codes) 
  - Include if diagnostic procedures mentioned
  
Category 3: Therapeutic Procedures (3,394 codes)
  - Include if procedures/treatments performed
  - Includes 14xxx series for emergency procedures
  
Category 4: Oral and Maxillofacial Services
  - Only for dental/oral contexts
  
Category 5: Diagnostic Imaging Services (537 codes)
  - NEVER use as primary billing code
  - These are ordered, not performed during consultation
  
Category 6: Pathology Services (614 codes)
  - NEVER use as primary billing code
  - These are ordered, not performed during consultation
  
Category 7: Cleft and Craniofacial Services
  - Specialized, rarely used
  
Category 8: Miscellaneous Services (276 codes)
  - Various other services
```

### Key Groups in Category 1 (Most Important)
```
A1:  General Practitioner Attendances
A3:  Specialist Attendances  
A4:  Consultant Physician Attendances
A21: Emergency Department Attendances (5001-5036)
A22: GP After-Hours Attendances
```

## Recommended Approach: Four-Stage Hybrid with Pre-filtering

### Stage 0: Category Pre-filtering (NEW - Critical)
- LLM categorizes consultation note
- Determines relevant categories (1, 3, etc.)
- Detects context (emergency, GP, specialist)
- Reduces search from 6,000 to ~600-1,500 codes
- Prevents category mismatches

### Stage 1: Fast Filtering (Within Categories)
- TF-IDF matching ONLY within selected categories
- Medical term extraction with category context
- Reduce candidate pool to top 50 from relevant categories
- Much more accurate due to category constraints

### Stage 2: Smart Ranking (Category-Aware)
- Embeddings computed per category for better relevance
- Calculate similarity within category context
- Take top 20 by similarity score
- Boost scores based on detected context (ED, procedures, etc.)

### Stage 3: LLM Reasoning (With Category Context)
- LLM reasoning for top 20 candidates
- Include category rules in prompt
- Validate against category constraints
- Structured JSON output with justifications

## Detailed Implementation Plan

### Phase 1: Core Pipeline (Hours 1-4) ✅ COMPLETED

#### Hour 1: Data Foundation ✅
```python
Tasks:
- Parse MBS XML → clean JSON/dict structure
- Extract: code, description, category
- Save preprocessed data for reuse
- Create sample test cases
```

#### Hour 2: Basic Matcher ✅
```python
Tasks:
- Implement keyword extraction from notes
- Build TF-IDF or simple text matching
- Return top 50 candidates
- Test with sample notes
```

#### Hour 3: Embedding Layer ✅
```python
Tasks:
- Install sentence-transformers
- Find medical model (BioBERT/ClinicalBERT) or use general
- Pre-compute MBS code embeddings at startup
- Implement embed_and_rank() for notes → similarity scoring
```

#### Hour 4: LLM Reasoning ✅
```python
Tasks:
- Integrate OpenAI/Claude API
- Design prompt for reasoning
- Get structured reasoning for top 20
- Format JSON response
- Create modular design for future JSON response changes
- Add placeholder functions for Phase 3 Additional Notes
```

### Phase 1.5: API Development (Hours 5-7)

#### Hour 5: FastAPI Implementation
```python
Tasks:
- Create src/api/ directory structure
- Implement main.py with FastAPI app
- Create Pydantic request/response models
- Build /api/v1/analyze endpoint
- Add basic input validation
- Test with curl/httpie
```

#### Hour 6: Production Optimizations
```python
Tasks:
- Add /health and /ready endpoints
- Implement caching for MBS codes and embeddings
- Add CORS middleware for frontend
- Create error handling with fallback
- Add request timeout (30s max)
- Implement structured logging
```

#### Hour 7: Testing & Documentation
```python
Tasks:
- Write API integration tests with pytest
- Test all synthetic consultation files
- Create API documentation (OpenAPI/Swagger)
- Write usage examples
- Performance benchmarking
- Update README with API section
```

## Implementation Structure

```python
# Enhanced architecture with category pre-filtering
src/
├── categorizer.py           # NEW - LLM category pre-filtering
│   ├── categorize_note()    # Determine categories & context
│   ├── detect_context()     # Emergency/GP/Specialist detection
│   └── assess_complexity()  # Ordinary/High complexity scoring
│
├── mbs_parser.py            # ENHANCED - Richer data extraction
│   ├── load_mbs_codes()     # Parse XML with all fields
│   ├── build_category_index() # Category→Codes mapping
│   └── build_group_index()  # Group→Codes mapping
│
├── text_matcher.py          # ENHANCED - Category-aware filtering
│   ├── fast_filter()        # TF-IDF within categories only
│   └── apply_category_filter() # Filter by selected categories
│
├── embeddings.py            # ENHANCED - Category context
│   ├── precompute_embeddings() # Per-category embeddings
│   └── embed_and_rank()     # Category-aware ranking
│
├── llm_reasoning.py         # ENHANCED - Category validation
│   ├── get_llm_reasoning()  # Include category rules
│   └── validate_categories() # Ensure correct categories
│
└── api/
    ├── main.py              # FastAPI app
    └── dependencies.py      # ENHANCED pipeline integration
```

## Required Dependencies

```bash
# Core dependencies (already installed)
uv add pandas scikit-learn sentence-transformers fastapi uvicorn openai pydantic python-multipart

# Production deployment dependencies
uv add gunicorn python-dotenv

# Development dependencies
uv add --dev pytest pytest-cov httpx
```

## Production Deployment Architecture

### Containerization Strategy

```dockerfile
# Multi-stage Dockerfile for optimization
FROM python:3.11-slim as builder
# Build stage: compile dependencies, prepare models

FROM python:3.11-slim as runtime
# Runtime: minimal image with pre-loaded models
# Use Gunicorn with Uvicorn workers for production
CMD ["gunicorn", "src.api.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080"]
```

### Google Cloud Run Deployment

```yaml
# Cloud Run Configuration
service: mbs-rag-api
runtime: python311
resources:
  cpu: 2-4 vCPUs
  memory: 2-4 GB
scaling:
  min_instances: 0-1  # Keep 1 warm for better UX
  max_instances: 10-100
  concurrency: 100-1000
environment_variables:
  - OPENAI_API_KEY (via Secret Manager)
  - ENVIRONMENT=production
  - LOG_LEVEL=INFO
```

### Deployment Pipeline

```bash
# Build and deploy commands
docker build -t gcr.io/PROJECT_ID/mbs-rag:v1 .
docker push gcr.io/PROJECT_ID/mbs-rag:v1
gcloud run deploy mbs-rag \
  --image gcr.io/PROJECT_ID/mbs-rag:v1 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10
```

### API Structure for Production

```python
src/
  api/
    __init__.py
    main.py              # FastAPI app with lifespan events
    routes/
      __init__.py
      analysis.py        # /analyze endpoint
      health.py          # /health, /ready endpoints
    models/
      __init__.py
      request.py         # Pydantic request models
      response.py        # Pydantic response models
    dependencies.py      # Shared dependencies, caching
    middleware.py        # CORS, logging, error handling
    tests/
      test_routes.py
      test_integration.py
```

### Critical Optimizations

1. **Cold Start Mitigation**:
   - Pre-load models in Docker image
   - Use Cloud Run "always allocated CPU"
   - Keep min_instances=1 for warm starts
   - Lazy load OpenAI client (fast)

2. **Caching Strategy**:
   - MBS codes: Load once at startup
   - Embeddings: Pre-compute and cache
   - TF-IDF vectorizer: Cache after first fit
   - LRU cache for recent consultations

3. **Error Handling**:
   - Graceful OpenAI API failures → fallback to embeddings
   - Request timeout: 30 seconds max
   - Structured error responses
   - No PHI/PII in logs

4. **Monitoring**:
   - `/health` - Basic liveness check
   - `/ready` - Model loading status
   - `/metrics` - Prometheus metrics
   - Structured logging to Cloud Logging
   - Cloud Trace for request tracing

### Files Needed for Deployment

```
Dockerfile           # Container definition
.dockerignore       # Exclude unnecessary files
cloudbuild.yaml     # CI/CD pipeline
requirements.txt    # Or use UV's lock file
startup.sh          # Pre-load models script
.gcloudignore      # For direct deployments
.env.example       # Environment template
```

### Phase 1.6: Deployment (Hours 8-10)

#### Hour 8: Containerization
```python
Tasks:
- Create multi-stage Dockerfile
- Write .dockerignore file
- Add Gunicorn configuration
- Build and test container locally
- Optimize image size (<500MB target)
- Test with docker-compose
```

#### Hour 9: Cloud Deployment
```python
Tasks:
- Create Google Cloud project setup script
- Write cloudbuild.yaml for CI/CD
- Configure Artifact Registry
- Set up Secret Manager for API keys
- Create Cloud Run service configuration
- Deploy to Cloud Run
```

#### Hour 10: Production Verification
```python
Tasks:
- End-to-end testing on Cloud Run
- Load testing with multiple concurrent requests
- Verify health checks and monitoring
- Test with all synthetic data
- Create deployment runbook
- Final documentation updates
```

### Phase 1.7: Accuracy Improvements (Hours 11-13) 🚧 CURRENT PRIORITY

#### Hour 11: LLM-Based Category Pre-filtering with MBS Book Extraction
```python
Tasks:
Part A - Extract Structured Data from MBS Book (45 min):
- Create mbs_extractor.py to parse MBS Book Word document:
  - Extract all 418 tables containing code definitions
  - Parse hierarchical structure (Category → Group → Subgroup → Items)
  - Focus on Table 56+ containing emergency codes (5001-5036)
  - Extract complexity levels and age ranges
- Build structured JSON from Word document:
  - Categories with names and code counts
  - Groups (A1=GP, A21=Emergency, etc.) with code lists
  - Complexity mappings (ordinary/more than ordinary/high)
  - Rules and restrictions (e.g., 14xxx must be with A21)
- Create data/mbs_structured.json:
  {
    "categories": {
      "1": {"name": "Professional Attendances", "groups": {...}},
      "3": {"name": "Therapeutic Procedures", "groups": {...}}
    },
    "groups": {
      "A21": {
        "name": "Emergency Department",
        "codes": ["5001", "5012", "5016", "5019"],
        "complexity_levels": {...}
      }
    },
    "rules": {
      "emergency_procedures": "14xxx series must bill with Group A21",
      "exclude_primary": ["Category 5 (imaging)", "Category 6 (pathology)"]
    }
  }

Part B - Implement Intelligent Categorizer (45 min):
- Create categorizer.py module using extracted MBS structure:
  - Load mbs_structured.json for authoritative rules
  - Use LLM to detect consultation context
  - Apply MBS rules to determine valid categories
- Implement categorization with rule enforcement:
  - Emergency keywords → Filter to Group A21 codes only
  - Procedure mentions → Include Category 3 + relevant 14xxx
  - Always include Category 1 for consultations
  - Never return Category 5/6 as primary codes
- Return structured categorization result:
  {
    "primary_category": 1,
    "additional_categories": [3],
    "group_focus": "A21",  # For emergency department
    "complexity": "high",
    "excluded_categories": [5, 6],
    "code_pool_size": 650  # Reduced from 6000
  }
- Integrate into pipeline before TF-IDF stage
- Test with emergency department sample cases
```

#### Hour 12: Enhanced Data Extraction
```python
Tasks:
- Modify mbs_parser.py to capture additional XML fields:
  - SubGroup and SubHeading for hierarchical categorization
  - ItemType to distinguish Service (S) vs Procedure (P)
  - FeeType (Normal vs Derived)
  - Group descriptions (A1=GP, A21=Emergency, etc)
- Create enhanced data structure:
  - Add category_name field with descriptions
  - Add group_name field for better filtering
  - Parse duration requirements from descriptions
  - Extract complexity indicators
- Build category-to-codes mapping for fast filtering:
  - category_index[1] = [list of all Category 1 codes]
  - group_index['A21'] = [list of emergency codes]
- Re-process MBS XML with enhanced extraction
- Update mbs_codes.json with enriched data
- Create category_metadata.json for quick lookups
```

#### Hour 13: Improved Category-Aware Matching
```python
Tasks:
- Enhance text_matcher.py to use category pre-filtering:
  - Accept category filter from categorizer
  - Search only within relevant categories
  - Apply group-level filtering (e.g., A21 for ED)
- Implement smart filtering rules:
  - Category 1 only for pure consultations
  - Category 1 + 3 for consultation with procedures
  - Never return Category 5/6 as primary codes
- Add context-aware scoring:
  - Boost emergency codes when ED detected
  - Boost procedure codes (14xxx) when procedures mentioned
  - Apply duration matching within categories
- Update embeddings.py to leverage categories:
  - Compute embeddings per category for better relevance
  - Use category context in similarity scoring
- Enhance LLM reasoning with category knowledge:
  - Pass category context to improve accuracy
  - Include category rules in prompt
  - Validate recommendations against category rules
- Test complete pipeline with sample data
```

### Phase 2: Frontend (Hours 14-18)

#### Hour 14: React Setup & Project Structure
```python
Tasks:
- Initialize React app with Vite/Next.js
- Set up TypeScript configuration
- Install UI libraries (Tailwind CSS, shadcn/ui)
- Create folder structure (components, hooks, services)
- Set up environment variables for API endpoint
- Configure ESLint and Prettier
```

#### Hour 15: Consultation Input Interface
```python
Tasks:
- Create main layout with header/footer
- Build consultation notes textarea component
- Add patient context fields (optional: age, gender)
- Implement character count and validation
- Add example consultation templates/snippets
- Create loading states and animations
```

#### Hour 16: Results Display & Reasoning
```python
Tasks:
- Design MBS code result cards
- Implement confidence score visualization (progress bars)
- Create expandable reasoning sections
- Add color coding for confidence levels
- Build copy-to-clipboard for codes
- Implement sorting/filtering options
```

#### Hour 17: Feedback System UI
```python
Tasks:
- Add thumbs up/down buttons per code
- Create feedback modal for detailed input
- Implement toast notifications for feedback
- Build feedback history view
- Add "Report Issue" functionality
- Store feedback locally before API integration
```

#### Hour 18: API Integration & Deployment
```python
Tasks:
- Create API service layer with Axios/Fetch
- Implement error handling and retries
- Add request/response interceptors
- Connect all components to live API
- Deploy to Vercel
- Configure CORS and environment variables
```

### Phase 3: Enhanced Processing (Hours 16-20)

#### Hour 16: Additional Notes Research
```python
Tasks:
- Study MBS Additional Notes structure
- Identify key AN patterns and rules
- Design AN data model
- Plan integration with existing pipeline
- Create AN test cases
```

#### Hour 17: Database Setup
```python
Tasks:
- Set up PostgreSQL/Firestore
- Design schema for feedback storage
- Create tables for user sessions
- Implement connection pooling
- Add database migrations
```

#### Hour 18: Feedback API
```python
Tasks:
- Create feedback endpoints (POST /feedback)
- Store thumbs up/down per code
- Implement detailed feedback storage
- Add analytics queries
- Create feedback dashboard API
```

#### Hour 19: AN Processing Implementation
```python
Tasks:
- Parse and index Additional Notes
- Enhance LLM prompts with AN context
- Update pipeline to include AN matching
- Test with complex medical scenarios
- Measure accuracy improvements
```

#### Hour 20: Caching Layer
```python
Tasks:
- Set up Redis/Memorystore
- Cache frequent consultations
- Implement cache invalidation
- Add result versioning
- Monitor cache hit rates
```

### Phase 4: Production Hardening (Hours 21-25)

#### Hour 21: Authentication & Authorization
```python
Tasks:
- Implement API key management
- Add JWT authentication
- Create user roles (doctor, admin)
- Secure sensitive endpoints
- Add audit logging
```

#### Hour 22: Rate Limiting & Cost Control
```python
Tasks:
- Implement rate limiting per API key
- Add OpenAI API cost tracking
- Create usage quotas
- Build billing integration
- Add cost alerts
```

#### Hour 23: Monitoring & Observability
```python
Tasks:
- Set up Cloud Monitoring dashboards
- Create custom metrics
- Implement distributed tracing
- Add error tracking (Sentry)
- Create SLO/SLA monitoring
```

#### Hour 24: Queue System & Scaling
```python
Tasks:
- Implement Cloud Tasks/Pub-Sub
- Add request queuing for LLM
- Create batch processing jobs
- Implement auto-scaling rules
- Add circuit breakers
```

#### Hour 25: Performance Optimization
```python
Tasks:
- Profile and optimize slow paths
- Implement response compression
- Add CDN for static assets
- Optimize database queries
- Fine-tune model loading
```

### Phase 5: Offline Capability (Hours 26-30)

#### Hour 26: Local LLM Research
```python
Tasks:
- Evaluate Ollama, llama.cpp, MLX
- Test medical-specific models
- Benchmark performance vs API
- Assess hardware requirements
- Design offline architecture
```

#### Hour 27: Offline Model Implementation
```python
Tasks:
- Set up local model server
- Implement model quantization
- Create inference pipeline
- Add model caching
- Test accuracy vs online
```

#### Hour 28: Hybrid Online/Offline Logic
```python
Tasks:
- Detect network availability
- Implement fallback logic
- Create sync queue for offline
- Add conflict resolution
- Build mode selection UI
```

#### Hour 29: Desktop Application
```python
Tasks:
- Set up Electron/Tauri wrapper
- Bundle models with app
- Create installer packages
- Implement auto-updates
- Add desktop notifications
```

#### Hour 30: Data Synchronization
```python
Tasks:
- Build offline data store
- Implement sync protocol
- Handle merge conflicts
- Add backup/restore
- Create sync status UI
```