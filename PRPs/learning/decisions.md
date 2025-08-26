# Technical Decisions

## Use UV Package Manager
**Date:** 2025-08-25
**Options considered:**
- Option A: UV (Astral's fast package manager)
- Option B: Traditional pip/venv
- Option C: Poetry

**Chose:** Option A (UV)
**Reason:** Blazing fast dependency resolution, modern tooling, excellent developer experience
**Trade-offs:** Newer tool, less widespread adoption

## XML Parsing with iterparse
**Date:** 2025-08-25
**Options considered:**
- Option A: ET.iterparse for streaming
- Option B: Load entire XML into memory
- Option C: Use external XML database

**Chose:** Option A (iterparse)
**Reason:** Memory efficient for 8MB file, clears elements after processing
**Trade-offs:** Slightly more complex code than simple parse

## Phase 1: Basic Descriptions Only
**Date:** 2025-08-25
**Options considered:**
- Option A: Start with basic descriptions, add Additional Notes later
- Option B: Full implementation including Additional Notes from start

**Chose:** Option A (Incremental approach)
**Reason:** Faster MVP delivery, validates core concept before complexity
**Trade-offs:** Initial version less accurate without eligibility criteria

## Cache Parsed Data as JSON
**Date:** 2025-08-25
**Options considered:**
- Option A: Cache as JSON file
- Option B: SQLite database
- Option C: Always parse XML on demand

**Chose:** Option A (JSON cache)
**Reason:** Simple, fast loading (2.5MB), no database overhead
**Trade-offs:** Less query flexibility than database

## Pattern: Vertical Slice Architecture
**When to use:** Organizing features and their tests
**Implementation:** Tests live next to code they test in feature folders
**Benefits:** Better cohesion, easier to find related files

## Pre-compute Embeddings Locally vs Cloud Runtime
**Date:** 2025-08-26
**Options considered:**
- Option A: Pre-compute embeddings locally, include in Docker image
- Option B: Compute embeddings at runtime on Cloud Run
- Option C: Use external embedding service

**Chose:** Option A (Pre-computed local)
**Reason:** 99.8% faster loading (17s → 0.031s), MacBook MPS acceleration, deterministic results
**Trade-offs:** Larger Docker image (8.12MB), need to recompute if codes change

## OpenAI Provider Method Interface
**Date:** 2025-08-26
**Options considered:**
- Option A: Add generate() method for compatibility
- Option B: Modify mbs_categorizer to use get_reasoning()
- Option C: Create adapter pattern

**Chose:** Option A (Add generate method)
**Reason:** Maintains backward compatibility, simple implementation, doesn't break existing code
**Trade-offs:** Interface now has two similar methods

## Pattern: Local Compute + Docker Packaging
**When to use:** When expensive AI operations run better on local hardware than cloud
**Implementation:** 
```python
# Local script computes embeddings with MPS
embeddings = model.encode(texts, device="mps")
np.savez_compressed("embeddings.npz", embeddings=embeddings)

# Production loads pre-computed results instantly  
data = np.load("embeddings.npz")
embeddings = data['embeddings']  # 0.031s vs 17s
```
**Benefits:** Massive performance gains, predictable deployment, optimal hardware usage

## Category-Aware Scoring Strategy
**Date:** 2025-08-26
**Options considered:**
- Option A: Hard filtering only (exclude wrong categories completely)
- Option B: Multiplicative score adjustments (boosts/penalties)
- Option C: Additive score adjustments
- Option D: Replace scores entirely based on category

**Chose:** Option B (Multiplicative adjustments)
**Reason:** Preserves original relevance while allowing context influence, mathematically stable
**Trade-offs:** More complex than hard filtering, requires careful boost factor tuning

## Rule-Based Category Filters
**Date:** 2025-08-26
**Options considered:**
- Option A: Only LLM-based filtering
- Option B: Only rule-based filtering
- Option C: Hybrid with rule-based as primary, LLM as enhancement
- Option D: LLM primary with rule-based fallback

**Chose:** Option D (LLM primary with rule fallback)
**Reason:** Best accuracy when LLM available, guaranteed functionality without it
**Trade-offs:** Additional complexity maintaining two systems

## Pattern: Pass Context Through Pipeline
**When to use:** When early pipeline stages produce context needed by later stages
**Implementation:** Add optional categorization parameter to all pipeline functions
**Benefits:** No global state, backward compatible, testable in isolation

## TF-IDF with Module-Level Caching
**Date:** 2025-08-25
**Options considered:**
- Option A: Build TF-IDF matrix on every request
- Option B: Cache matrix at module level
- Option C: Store pre-computed matrix in file

**Chose:** Option B (Module-level caching)
**Reason:** Instant subsequent searches (0.001s), no file I/O overhead, automatic initialization
**Trade-offs:** Uses ~10-20MB memory, matrix rebuilds on process restart

## Medical Term Extraction Approach
**Date:** 2025-08-25
**Options considered:**
- Option A: Simple regex patterns
- Option B: Medical NLP library (scispacy, medspacy)
- Option C: Custom trained NER model

**Chose:** Option A (Regex patterns)
**Reason:** Fast, no additional dependencies, sufficient for MVP phase
**Trade-offs:** Less sophisticated than medical NLP, may miss complex medical terminology

## TF-IDF Vectorizer Parameters
**Date:** 2025-08-25
**Options considered:**
- Option A: ngram_range=(1,3), max_features=5000
- Option B: ngram_range=(1,2), max_features=10000
- Option C: ngram_range=(1,4), max_features=3000

**Chose:** Option A (1-3 grams, 5000 features)
**Reason:** Good balance between capturing medical phrases and memory usage
**Trade-offs:** Might miss longer medical phrases, but keeps memory footprint reasonable

## Pattern: Global Caching for Performance
**When to use:** Expensive computations that don't change between requests
**Implementation:** Module-level variables with lazy initialization
```python
_cache = None

def function():
    global _cache
    if _cache is None:
        _cache = expensive_computation()
    return use_cache(_cache)
```
**Benefits:** Eliminates redundant computation, sub-millisecond response times

## Pattern: Comprehensive Test Coverage from Start
**When to use:** All new modules
**Implementation:** Write tests alongside implementation, not after
**Benefits:** Caught edge cases early (empty notes, special characters), confidence in refactoring

## Embedding Model Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Medical-specific models (BioBERT, ClinicalBERT)
- Option B: General sentence transformers
- Option C: Custom fine-tuned model

**Chose:** Option A with fallback to B
**Reason:** Medical models understand clinical terminology better, but may not always be available
**Trade-offs:** Larger model size (~400MB), slower initial download

## Embedding Pre-computation Pattern
**Date:** 2025-08-25
**Options considered:**
- Option A: Pre-compute all embeddings at startup
- Option B: Compute embeddings on-demand
- Option C: Store pre-computed embeddings in file

**Chose:** Option A (Pre-compute at startup)
**Reason:** 6000 codes can be embedded in ~30s, then cached in memory for instant lookup
**Trade-offs:** ~100-200MB memory usage, startup delay on first run

## Similarity Score Normalization
**Date:** 2025-08-25
**Decision:** Normalize all similarity scores to 0.0-1.0 range
**Reason:** Consistent scoring across different stages (TF-IDF and embeddings)
**Implementation:** Use np.clip after cosine similarity calculation

## Pattern: Graceful Degradation
**When to use:** When external dependencies (models) may fail
**Implementation:** embed_and_rank_with_fallback function
**Benefits:** System remains functional even if embedding model unavailable

## Virtual Environment Management with UV
**Date:** 2025-08-25
**Problem:** UV was using global lewagon environment instead of project-specific
**Solution:** Always run `uv venv` to create .venv in project root
**Learning:** UV respects .venv in current directory over VIRTUAL_ENV variable
**Command sequence:**
```bash
rm -rf .venv
uv venv
source .venv/bin/activate
uv sync
```

## Pattern: Global Variable Declaration in Python
**When to use:** When accessing module-level cache variables in functions
**Problem:** UnboundLocalError when trying to read/write global variables
**Solution:** Always declare `global variable_name` at function start
```python
def function():
    global _cache_variable
    if _cache_variable is None:
        _cache_variable = compute_value()
    return _cache_variable
```
**Benefits:** Prevents scoping errors, makes intent explicit

## Model Selection Trade-offs
**Date:** 2025-08-25
**Options considered:**
- Option A: Always use medical models (BioBERT, ClinicalBERT)
- Option B: Default to general models, option for medical
- Option C: Only use general models

**Chose:** Option B (Default general, optional medical)
**Reason:** General models are 10x smaller, download faster, work well enough
**Trade-offs:** Slightly less medical understanding for much better UX

## Pattern: Integration Test Scripts
**When to use:** Testing multi-stage pipelines
**Implementation:** Standalone test_integration.py scripts
**Benefits:** 
- Visual feedback during development
- Easy debugging of stage transitions
- Performance benchmarking built-in
- No test framework overhead

## LLM Provider Abstraction Pattern
**Date:** 2025-08-25
**Options considered:**
- Option A: Direct OpenAI client usage
- Option B: Abstract provider interface with implementations
- Option C: Use existing framework (LangChain, LlamaIndex)

**Chose:** Option B (Abstract provider interface)
**Reason:** Clean separation, easy to add new providers, no heavy framework dependencies
**Trade-offs:** More initial code, but better long-term flexibility

## OpenAI Model Selection
**Date:** 2025-08-25
**Options considered:**
- Option A: GPT-4 (highest quality, expensive)
- Option B: GPT-4o-mini (good quality, affordable)
- Option C: GPT-3.5-turbo (fastest, cheapest)
- Option D: GPT-5 mini (newest, experimental)

**Chose:** Option B (GPT-4o-mini)
**Reason:** Best balance of quality medical reasoning and cost ($0.15/1M tokens)
**Trade-offs:** Slightly slower than GPT-3.5, but much better medical understanding
**Note:** GPT-5 mini tested but returns empty responses, needs future investigation

## Pattern: Provider Parameter Adaptation
**When to use:** Supporting multiple LLM versions with different APIs
**Implementation:**
```python
if "gpt-5" in model_name:
    params["max_completion_tokens"] = 2000
    params["temperature"] = 1  # GPT-5 only supports default
else:
    params["max_tokens"] = 2000
    params["temperature"] = 0.3
```
**Benefits:** Handles API evolution gracefully

## Structured JSON Output with TypedDict
**Date:** 2025-08-25
**Options considered:**
- Option A: Parse free text LLM responses
- Option B: Use JSON mode with TypedDict schema
- Option C: Use function calling for structured output

**Chose:** Option B (JSON mode + TypedDict)
**Reason:** Guaranteed valid JSON, type safety, clear schema definition
**Trade-offs:** Requires compatible models (GPT-4+), slightly more tokens

## Pattern: Graceful LLM Fallback
**When to use:** When LLM may fail or be unavailable
**Implementation:**
```python
try:
    llm_result = get_llm_reasoning(note, candidates)
except Exception:
    # Fall back to embedding scores
    return convert_embeddings_to_recommendations(candidates)
```
**Benefits:** System remains functional without LLM, predictable degradation

## Retry Strategy with Exponential Backoff
**Date:** 2025-08-25
**Decision:** Implement 3 retries with 1s, 2s, 4s delays
**Reason:** Handles transient API failures gracefully
**Trade-offs:** Adds latency on failures, but improves reliability

## Synthetic Data Generation Approach
**Date:** 2025-08-25
**Options considered:**
- Option A: Use LLM to generate synthetic notes
- Option B: Manually create diverse medical scenarios
- Option C: Use real anonymized data

**Chose:** Option B (Manual creation)
**Reason:** Full control over scenarios, covers edge cases, no PHI concerns
**Trade-offs:** Time-consuming, but ensures comprehensive testing

## Pattern: CLI Tools for Pipeline Testing
**When to use:** Testing data processing pipelines
**Implementation:** Standalone scripts with argparse
**Benefits:**
- Easy batch processing
- Visual progress feedback  
- Configurable parameters
- No web UI needed for testing

## Module-Level Provider Caching
**Date:** 2025-08-25
**Pattern:** Cache expensive objects at module level
```python
_provider = None

def get_provider():
    global _provider
    if _provider is None:
        _provider = create_provider()
    return _provider
```
**Benefits:** Single initialization, consistent across requests
**Trade-offs:** Harder to mock in tests, requires explicit reset

## Pattern: Comprehensive Test Mocking
**When to use:** Testing code with external dependencies
**Implementation:** Mock at provider level, not implementation
```python
@patch("src.llm_reasoning.create_provider")
def test_function(mock_create):
    mock_provider = Mock()
    mock_create.return_value = mock_provider
```
**Benefits:** Tests remain valid when implementation changes

## FastAPI Modular Architecture
**Date:** 2025-08-25
**Options considered:**
- Option A: Single file FastAPI app with all endpoints
- Option B: Modular structure with separated concerns (main, routes, models, dependencies)
- Option C: Domain-driven design with feature folders

**Chose:** Option B (Modular structure)
**Reason:** Clean separation follows SOLID principles, easier to test, maintainable as API grows
**Trade-offs:** More initial setup files, but better long-term structure

## Pydantic v2 for API Models
**Date:** 2025-08-25
**Options considered:**
- Option A: Use existing TypedDict structures for API
- Option B: Create Pydantic v2 models for request/response validation
- Option C: Mix TypedDict internally with basic dict validation

**Chose:** Option B (Pydantic v2 models)
**Reason:** Type safety, automatic validation, OpenAPI schema generation, better error messages
**Trade-offs:** Manual conversion from TypedDict to Pydantic models required

## Pipeline Integration Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Rewrite pipeline modules to use Pydantic models
- Option B: Keep existing TypedDict, convert at API boundary
- Option C: Use dependency injection for pipeline components

**Chose:** Option B (Convert at API boundary)
**Reason:** Preserves working pipeline code, isolates API concerns, minimal refactoring
**Trade-offs:** Manual conversion logic needed in routes.py

## Type Safety Approach with Mypy
**Date:** 2025-08-25
**Options considered:**
- Option A: Ignore all type errors with # type: ignore
- Option B: Fix type signatures across all modules
- Option C: Strategic type: ignore for known interface mismatches

**Chose:** Option C (Strategic type ignores)
**Reason:** Maintains type checking benefits while handling TypedDict/Pydantic interface differences
**Trade-offs:** Some type safety lost at specific boundaries

## Error Handling Level for Hour 5
**Date:** 2025-08-25
**Options considered:**
- Option A: Basic 500 errors with exception details
- Option B: Specific error types with proper HTTP status codes
- Option C: Full error handling with logging and monitoring

**Chose:** Option A (Basic 500 errors)
**Reason:** Meets Hour 5 scope requirements, can enhance in Hour 6
**Trade-offs:** Less user-friendly error messages, harder debugging in production

## Pattern: FastAPI Request Options Handling
**When to use:** Optional nested objects in request models
**Implementation:**
```python
options = request.options or AnalysisOptions()
# Use options.field_name safely
```
**Benefits:** Handles None values gracefully, provides sensible defaults

## Pattern: Pipeline Module Caching in Dependencies
**When to use:** Expensive one-time initialization for API endpoints
**Implementation:**
```python
_mbs_codes_cache: dict[str, Any] = {}

def get_mbs_codes() -> dict[str, Any]:
    global _mbs_codes_cache
    if not _mbs_codes_cache:
        _mbs_codes_cache = load_cached_codes()
    return _mbs_codes_cache
```
**Benefits:** Avoids reloading MBS codes on every request, consistent with existing patterns

## Response Caching Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: In-memory TTL cache with cachetools
- Option B: Redis for distributed caching
- Option C: Database-backed caching

**Chose:** Option A (TTLCache from cachetools)
**Reason:** Simple, no external dependencies, sufficient for single-instance deployment
**Trade-offs:** Not distributed, cache lost on restart, limited by instance memory

## Health Check Architecture
**Date:** 2025-08-25
**Options considered:**
- Option A: Single health endpoint with all checks
- Option B: Separate health, readiness, and liveness endpoints
- Option C: Simple boolean health check

**Chose:** Option B (Separate endpoints)
**Reason:** Kubernetes/orchestration best practices, granular monitoring
**Trade-offs:** More endpoints to maintain, slightly more complex

## Cache Key Generation
**Date:** 2025-08-25
**Options considered:**
- Option A: MD5 hash of note + sorted JSON options
- Option B: SHA256 hash for better security
- Option C: Simple string concatenation

**Chose:** Option A (MD5 with sorted JSON)
**Reason:** Fast, deterministic, sufficient for cache keys (not security)
**Trade-offs:** MD5 not cryptographically secure (but not needed here)

## Pattern: Three-Tier Caching
**When to use:** Multi-stage processing pipelines
**Implementation:**
1. MBS codes cache - loaded at startup, never expires
2. Embeddings cache - LRU with functools, computed on demand
3. Response cache - TTL-based, expires after 1 hour
**Benefits:** Each cache level optimized for its data characteristics

## Pattern: Graceful Degradation
**When to use:** External service dependencies
**Implementation:**
```python
try:
    result = await external_service()
    return enhanced_result(result)
except ServiceError:
    logger.warning("Service unavailable, using fallback")
    return fallback_result()
```
**Benefits:** System remains functional during partial failures

## CORS Configuration Approach
**Date:** 2025-08-25
**Options considered:**
- Option A: Allow specific origins list
- Option B: Allow all origins (*)
- Option C: Environment-based configuration

**Chose:** Option A (Specific origins)
**Reason:** Security best practice, explicit control
**Trade-offs:** Must update list for new frontends

## Pattern: Request Timing Middleware
**When to use:** Performance monitoring in production
**Implementation:**
```python
async def timing_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(time.time() - start)
    return response
```
**Benefits:** Visibility into slow requests, helps identify bottlenecks

## Test Organization Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Keep all tests in single tests/ directory
- Option B: Organize into unit/integration/performance subdirectories
- Option C: Keep tests next to source code

**Chose:** Option B (Organized subdirectories)
**Reason:** Clear separation of test types, easier to run specific test suites
**Trade-offs:** More complex directory structure, but better organization
**Learning:** Use pytest markers to further categorize tests within directories

## Pattern: Session-Scoped Test Fixtures
**When to use:** Expensive setup that can be shared across tests
**Implementation:**
```python
@pytest.fixture(scope="session")
def client(app):
    return TestClient(app)
```
**Benefits:** Dramatically reduces test execution time
**Learning:** Be careful with state - use autouse fixtures to clear caches between tests

## Test Data Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Hardcode test data in each test
- Option B: Create fixture files with diverse scenarios
- Option C: Generate random test data

**Chose:** Option B (Fixture files)
**Reason:** Reusable, comprehensive coverage of edge cases
**Implementation:** Created 12 diverse medical consultation scenarios
**Learning:** Good test fixtures are invaluable for thorough testing

## API Documentation Approach
**Date:** 2025-08-25
**Options considered:**
- Option A: Minimal docstrings, rely on auto-generation
- Option B: Comprehensive docstrings with examples
- Option C: Separate documentation system

**Chose:** Option B (Comprehensive docstrings)
**Reason:** Documentation lives with code, visible in IDE and Swagger UI
**Learning:** Rich docstrings with examples greatly improve API usability

## Pattern: Mock at the Right Level
**When to use:** Testing components with external dependencies
**Problem:** Mocking too low (e.g., OpenAI client) makes tests brittle
**Solution:** Mock at provider abstraction level
```python
@patch("src.llm_providers.create_provider")  # Good
@patch("openai.ChatCompletion.create")       # Bad - too low level
```
**Benefits:** Tests remain valid when implementation changes

## Coverage Configuration Strategy
**Date:** 2025-08-25
**Decision:** Set coverage target to 0% initially, increase gradually
**Reason:** Allows tests to run while building coverage incrementally
**Learning:** Start with working tests, then improve coverage metrics

## Pattern: Comprehensive Error Testing
**When to use:** Testing API endpoints and error handling
**Implementation:** Test all error scenarios:
- Validation errors (422)
- Missing resources (404)
- Server errors (500)
- Timeouts and network errors
**Learning:** Error path testing often reveals more bugs than happy path

## Performance Test Design
**Date:** 2025-08-25
**Key metrics identified:**
- Response time percentiles (P50, P90, P95, P99)
- Cache hit rates
- Concurrent request handling
- Memory stability under load
**Learning:** Performance tests should measure both speed and stability

## Documentation Structure
**Date:** 2025-08-25
**Three-document approach:**
1. API Reference - Technical endpoint documentation
2. Developer Guide - Architecture and setup
3. User Guide - Practical usage and examples
**Learning:** Different audiences need different documentation styles

## Pattern: Validation Scripts
**When to use:** Verifying implementation completeness
**Implementation:** Created validate_hour_7.py to check all requirements
**Benefits:** Quick verification of implementation status
**Learning:** Validation scripts save time and ensure completeness

## Multi-Stage Docker Builds for Python
**Date:** 2025-08-25
**Options considered:**
- Option A: Single-stage Dockerfile with all dependencies
- Option B: Multi-stage build with separate builder stage
- Option C: Distroless base image

**Chose:** Option B (Multi-stage build)
**Reason:** Reduces final image size by ~40%, separates build dependencies from runtime
**Trade-offs:** Slightly more complex Dockerfile, but much smaller production image

## Gunicorn Worker Configuration
**Date:** 2025-08-25
**Options considered:**
- Option A: Sync workers (default)
- Option B: Uvicorn workers for async FastAPI
- Option C: Gevent workers

**Chose:** Option B (uvicorn.workers.UvicornWorker)
**Reason:** Required for async FastAPI endpoints, better performance for I/O-bound operations
**Trade-offs:** Slightly higher memory usage per worker

## Container User Security
**Date:** 2025-08-25
**Decision:** Always run containers as non-root user (UID 1000)
**Reason:** Security best practice, prevents privilege escalation
**Implementation:** Create appuser in Dockerfile, chown all files, USER appuser directive

## Model Pre-loading Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Download models at runtime (lazy loading)
- Option B: Pre-download models during Docker build
- Option C: Mount models as volume

**Chose:** Option B (Pre-download in Dockerfile)
**Reason:** Faster container startup, predictable performance, no runtime downloads
**Trade-offs:** Increases image size by ~50MB, but worth it for production stability

## Health Check Implementation
**Date:** 2025-08-25
**Options considered:**
- Option A: Use curl in health check
- Option B: Use Python urllib for health check
- Option C: Custom health check script

**Chose:** Option B (Python urllib)
**Reason:** More reliable in minimal containers, no need for curl installation
**Implementation:** `python -c "import urllib.request; exit(0 if urllib.request.urlopen('http://localhost:8000/health').status == 200 else 1)"`

## Pattern: Docker Build Scripts
**When to use:** Standardizing Docker build process across team
**Implementation:** Created scripts/build.sh with BuildKit, tagging, and vulnerability scanning
**Benefits:** Consistent builds, automatic tagging with git hash, optional security scanning
**Learning:** Build scripts prevent common mistakes and enforce best practices

## Environment Variable Management
**Date:** 2025-08-25
**Decision:** Never include .env files in Docker images
**Reason:** Security - secrets should be injected at runtime
**Implementation:** Use docker run -e or docker-compose environment section
**Pattern:** All configuration via environment variables following 12-factor app principles

## Docker Compose for Development
**Date:** 2025-08-25
**Decision:** Include docker-compose.yml for local development
**Reason:** Simplifies multi-container setups, consistent dev environment
**Features:** Health checks, resource limits, optional nginx proxy
**Learning:** Docker Compose bridges gap between development and production

## Nginx Reverse Proxy Configuration
**Date:** 2025-08-25
**Decision:** Include optional nginx configuration for production-like setup
**Features:** Load balancing, rate limiting, security headers, SSL ready
**Reason:** Many production deployments use nginx as reverse proxy
**Trade-offs:** Additional complexity, but provides production parity

## Pattern: Shell Script Automation
**When to use:** Standardizing complex Docker operations
**Implementation:** Create scripts/build.sh, run.sh, test-container.sh
**Benefits:** 
- Prevents command errors and typos
- Enforces best practices (BuildKit, tagging)
- Documents standard procedures
- Enables CI/CD integration
**Example:**
```bash
DOCKER_BUILDKIT=1 docker build \
  --cache-from mbs-rag:latest \
  --tag mbs-rag:${GIT_HASH} \
  .
```

## Pattern: Comprehensive .dockerignore
**When to use:** Building Docker images for production
**Implementation:** Exclude all non-essential files (tests, docs, cache, etc.)
**Benefits:**
- Reduces build context size (faster builds)
- Prevents secrets from entering image
- Smaller final image size
- Cleaner container filesystem
**Critical excludes:** .env files, .git, __pycache__, tests, virtual environments

## Pattern: Production Configuration Files
**When to use:** Deploying Python web applications
**Implementation:** Create gunicorn.conf.py with production settings
**Benefits:**
- Centralized configuration management
- Environment-based overrides
- Lifecycle hooks for monitoring
- Security limits and timeouts
**Key settings:**
- Workers: 2*CPU+1
- Worker class: uvicorn.workers.UvicornWorker
- Graceful timeout: 30s
- Request limits: Prevent DoS attacks

## Pattern: Docker Validation Documentation
**When to use:** After creating Docker configurations
**Implementation:** Create DOCKER_VALIDATION.md with step-by-step testing
**Benefits:**
- Reproducible validation process
- Clear success criteria
- Troubleshooting guidance
- Onboarding documentation
**Structure:**
1. Prerequisites
2. Build validation
3. Runtime tests
4. Production simulation
5. Troubleshooting guide

## Google Cloud Run Deployment Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Manual GCP console deployment
- Option B: gcloud CLI with shell scripts
- Option C: Terraform infrastructure as code
- Option D: GitHub Actions CI/CD pipeline

**Chose:** Option B (gcloud CLI with shell scripts)
**Reason:** Balance of automation and transparency, easy debugging, version controllable
**Trade-offs:** Less declarative than Terraform, more setup than manual console

## .gcloudignore vs .dockerignore
**Date:** 2025-08-25
**Decision:** Maintain separate .gcloudignore for Cloud Build context
**Learning:** .gcloudignore excludes files from Cloud Build context, not Docker build
**Critical difference:** Must include files needed for Docker build (uv.lock, data/)
**Pattern:**
```
# .dockerignore - for Docker build optimization
tests/
docs/
.git/

# .gcloudignore - for Cloud Build context
.git/
README.md
# DON'T exclude uv.lock or data/
```

## Secret Management Strategy
**Date:** 2025-08-25
**Options considered:**
- Option A: Environment variables in deployment
- Option B: Google Secret Manager
- Option C: Kubernetes secrets
- Option D: Config files in image

**Chose:** Option B (Google Secret Manager)
**Reason:** Centralized, auditable, automatic rotation support, integrated with IAM
**Trade-offs:** More complex setup, requires additional API enablement

## Cloud Run Resource Configuration
**Date:** 2025-08-25
**Decision:** 4GB RAM, 2 CPU, timeout 300s, min instances 1
**Reasoning:**
- 4GB RAM: sentence-transformers model ~200MB, embeddings cache ~200MB, headroom
- 2 CPU: Handles concurrent requests efficiently
- 300s timeout: LLM calls can take 10-30s, allows for cold starts
- Min instances 1: Keeps warm instance, acceptable cost for improved UX

## Pattern: Interactive Deployment Scripts
**When to use:** Complex deployment processes with multiple steps
**Implementation:** gcp/deploy.sh with user confirmation and validation
**Benefits:**
- Prevents accidental deployments
- Shows status at each step
- Allows rollback decisions
- Documents deployment process
**Structure:**
1. Pre-flight checks
2. User confirmation
3. Step-by-step execution with status
4. Post-deployment validation

## Build Context Optimization
**Date:** 2025-08-25
**Problem:** Cloud Build failing due to missing files excluded by .gcloudignore
**Solution:** Carefully distinguish between files needed for Docker build vs runtime
**Learning:** .gcloudignore excludes from Cloud Build upload, not from Docker build context
**Key insight:** uv.lock and data/ directory required for Docker build success

## Cloud Run PORT Environment Variable
**Date:** 2025-08-25
**Problem:** Cloud Run automatically sets PORT=8080, conflicted with our PORT=8000
**Solution:** Remove PORT from service configuration, let Cloud Run manage
**Learning:** Cloud Run manages certain environment variables automatically
**Pattern:** Don't override Cloud Run platform variables

## IAM Role Configuration
**Date:** 2025-08-25
**Decision:** Use default compute service account with secretmanager.secretAccessor role
**Reason:** Minimal permissions principle, specific to secret access only
**Command:** `gcloud projects add-iam-policy-binding PROJECT --member=serviceAccount:PROJECT-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor`

## API Enablement Order
**Date:** 2025-08-25
**Learning:** APIs must be enabled before dependent services work
**Sequence:**
1. Cloud Run API
2. Artifact Registry API  
3. Cloud Build API
4. Secret Manager API
5. Compute Engine API (for service accounts)
**Pattern:** Check API enablement first in deployment scripts

## Pattern: End-to-End Validation
**When to use:** After any production deployment
**Implementation:** Real API calls with live data, not just health checks
**Critical validation:**
- Health endpoints respond correctly
- Full pipeline executes (TF-IDF → Embeddings → LLM)
- LLM integration returns structured responses
- Performance within acceptable ranges
**Learning:** Infrastructure health ≠ functional validation

## Cold Start Mitigation
**Date:** 2025-08-25
**Problem:** 60-90 second cold starts due to sentence-transformers loading
**Options considered:**
- Option A: Accept cold starts
- Option B: Keep minimum instances warm
- Option C: Pre-load models in Docker image
- Option D: Use lighter embedding models

**Chose:** Combination of B and C
**Reason:** Min instances = 1 keeps service responsive, pre-loaded models reduce startup time
**Trade-offs:** Higher cost for always-on instance, but acceptable for production UX

## Pattern: Comprehensive Build Logs
**When to use:** Debugging Cloud Build failures
**Implementation:** `gcloud builds log BUILD_ID --stream`
**Learning:** Real-time build logs essential for debugging dependency issues
**Key insight:** sentence-transformers compilation takes ~5 minutes, appears to hang

## Cloud Build vs Local Docker Build
**Date:** 2025-08-25
**Decision:** Use Cloud Build for production, local Docker for development
**Reasons:**
- Cloud Build integrated with Artifact Registry
- Consistent build environment
- Better for CI/CD pipelines
- Automatic image pushing
**Trade-offs:** Slower than local builds, requires network connectivity

## Pattern: Deployment Success Documentation
**When to use:** After completing major deployments
**Implementation:** Create DEPLOYMENT_SUCCESS.md with full validation results
**Benefits:**
- Proves deployment worked end-to-end
- Documents live service URLs
- Records performance characteristics
- Provides troubleshooting baseline
**Structure:**
1. Service information and URLs
2. Validation results with examples
3. Performance metrics
4. Known issues and next steps
5. Infrastructure architecture diagram

## Production Timeout Configuration
**Date:** 2025-08-25
**Decision:** 300 seconds (5 minutes) for Cloud Run timeout
**Reason:** LLM processing typically 10-30s, but cold starts + complex queries can take longer
**Learning:** Default 30s timeout insufficient for ML workloads
**Command:** `gcloud run services update --timeout=300`

## Pattern: Gradual Rollout Validation
**When to use:** Deploying new services to production
**Implementation:**
1. Deploy with traffic=0
2. Validate service health
3. Route small percentage of traffic  
4. Monitor metrics
5. Gradually increase traffic
**Learning:** Blue-green deployment not always possible with managed services

## Categorization Before TF-IDF
**Date:** 2025-08-26
**Options considered:**
- Option A: Run TF-IDF on all 6,000 codes then filter
- Option B: Pre-filter codes by category/group before TF-IDF
- Option C: Post-filter after embeddings

**Chose:** Option B (Pre-filter before TF-IDF)
**Reason:** Dramatically reduces search space (75-90%), improves accuracy by eliminating irrelevant categories
**Trade-offs:** Additional LLM call adds 1-2 seconds, but overall accuracy improvement worth it

## Rule-Based Detection Order
**Date:** 2025-08-26
**Options considered:**
- Option A: Check GP first, then specialist
- Option B: Check specialist/referral first, then GP
- Option C: Use more complex regex patterns

**Chose:** Option B (Specialist before GP)
**Reason:** "Referred by GP" contains "GP" substring, would match GP detection incorrectly
**Trade-offs:** Must maintain careful order in elif chain

## Category Type Handling
**Date:** 2025-08-26
**Problem:** MBS codes have category as strings ("1", "2"), but categorizer returns integers
**Options considered:**
- Option A: Convert all to strings
- Option B: Convert all to integers with error handling
- Option C: Support both types

**Chose:** Option B (Convert to int with try/except)
**Reason:** Integer comparison more reliable, handles invalid categories gracefully
**Trade-offs:** Slightly more complex code, but more robust

## Pattern: Stage 0 Pre-filtering
**When to use:** When search space is large and can be logically segmented
**Implementation:** Run intelligent categorization before TF-IDF to reduce candidates
**Benefits:** 
- 75-90% reduction in search space
- Eliminates category mismatches (e.g., returning pathology codes for consultations)
- Improves downstream accuracy
**Example:** Emergency department consultations only search A21 group codes + procedures

## Pattern: LLM with Rule-Based Fallback
**When to use:** Production systems where LLM might be unavailable
**Implementation:**
```python
try:
    return llm_categorization(note, provider)
except Exception:
    return rule_based_categorization(note)
```
**Benefits:** System remains functional even if OpenAI is down, predictable behavior

## Anti-Pattern: Overly Broad Term Matching
**When to avoid:** Rule-based text detection with common substrings
**Problem:** Matching "gp" catches "Referred by GP to specialist"
**Bad example:**
```python
if "gp" in note_lower:  # Matches too many false positives
    return "GP consultation"
```
**Better approach:**
```python
if " gp " in note_lower or "general practitioner" in note_lower:
    return "GP consultation"
```
**Learning:** Use word boundaries or more specific phrases to avoid substring matches

## Pattern: Test-First Bug Discovery
**When to use:** Implementing complex rule-based logic
**Implementation:** Write comprehensive unit tests before fixing edge cases
**Benefits:**
- Discovered hyphenated duration bug ("15-minute" not matching)
- Found specialist/GP detection conflict
- Caught category type conversion issue
**Example:** Test suite revealed that specialist detection was never triggered due to GP match

## Focused Field Extraction vs Complete XML Parsing
**Date:** 2025-08-26
**Options considered:**
- Option A: Extract all 15+ XML fields (ItemType, FeeType, ProviderType, etc.)
- Option B: Extract only fields needed by categorizer (category, group, code, description)
- Option C: Extract all fields but only index essential ones

**Chose:** Option B (Extract only needed fields)
**Reason:** YAGNI principle - categorizer only uses category/group/code for filtering
**Trade-offs:** May need to revisit if future features require additional fields
**Learning:** Always check what downstream components actually use before implementing

## Index Storage Strategy
**Date:** 2025-08-26
**Options considered:**
- Option A: Single enhanced file with embedded indexes
- Option B: Separate files for each index (category, group, enhanced data)
- Option C: SQLite database with indexed tables

**Chose:** Option B (Separate index files)
**Reason:** Faster loading of specific indexes, cleaner separation, easier updates
**Trade-offs:** Multiple files to manage (4 total), but only ~300KB combined overhead

## Complexity Detection Order
**Date:** 2025-08-26
**Problem:** "Ordinary complexity" contains "complex", causing misclassification
**Options considered:**
- Option A: Check longer phrases first
- Option B: Check specific terms before general
- Option C: Use regex with word boundaries

**Chose:** Option B (Specific before general)
**Reason:** "ordinary complexity" → standard, not long
**Implementation:** Check "ordinary complexity" before checking for "complex"
**Learning:** Order matters in text matching - check more specific patterns first

## Pattern: O(1) Lookup with Fallback
**When to use:** Optimizing existing linear search algorithms
**Implementation:**
```python
def filter_indexed(data, indexes):
    if indexes:
        return use_index_lookup(data, indexes)  # O(1)
    return linear_search(data)  # O(n) fallback
```
**Benefits:** Performance improvement when indexes available, still works without them

## Pattern: Building Indexes During Parse
**When to use:** When you're already iterating through all data
**Implementation:** Build category/group indexes while parsing XML in single pass
**Benefits:** Avoids second pass, memory efficient, indexes ready immediately
**Example:** parse_mbs_xml_enhanced builds indexes during XML element processing

## Memory vs Performance Trade-off
**Date:** 2025-08-26
**Decision:** Use dictionaries for O(1) lookups despite 3x memory usage
**Reasoning:** 
- 6,000 items = ~300KB extra memory (acceptable)
- O(1) vs O(n) performance difference substantial
- Modern servers have plenty of RAM
**Learning:** For datasets < 100MB, favor performance over memory optimization

## Pattern: Backward Compatibility Through Separate Files
**When to use:** Enhancing existing data formats
**Implementation:** Keep original format, add enhanced versions as new files
**Example:**
- mbs_codes.json - original format (backward compatible)
- mbs_codes_enhanced.json - enhanced with new fields
- category_index.json - new index file
**Benefits:** Existing code continues working, new features opt-in

## Duration Extraction Pattern Priority
**Date:** 2025-08-26
**Decision:** Use lower bound for range patterns ("between 20 and 40" → 20)
**Reason:** Conservative estimate better for billing purposes
**Trade-offs:** May underestimate complexity for boundary cases
**Learning:** Medical billing prefers conservative estimates to avoid overcoding

## Pattern: Validation Scripts for Complex Features
**When to use:** After implementing multi-file outputs or complex requirements
**Implementation:** Create validate_hour_XX.py to verify all requirements
**Benefits:**
- Quick verification of implementation completeness
- Performance validation
- Backward compatibility checks
- Can be run in CI/CD pipeline
**Example:** validate_hour_12.py checks indexes, performance, and compatibility