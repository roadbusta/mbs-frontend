# Blockers Log

## [ACTIVE] MBS Additional Notes Complexity
**Date:** 2025-08-25
**Problem:** The Additional Notes (AN) in MBS codes contain complex eligibility criteria that are difficult to parse programmatically
**Impact:** May affect accuracy of code recommendations in Phase 1 MVP
**Solution:** Planning to defer AN processing to Phase 2, focus on basic descriptions for MVP

## [RESOLVED] GCP Cloud Run Cold Start Performance
**Date:** 2025-08-25
**Problem:** Cloud Run container takes 60-90 seconds to cold start due to sentence-transformers model loading
**Impact:** First API calls after idle periods experience significant latency
**Solution:** Set minimum instances to 1 to keep at least one instance warm, acceptable for MVP
**Resolution:** Production deployment configured with warm instances, 5-minute timeout for processing

## [RESOLVED] MBS XML Data Structure
**Date:** 2025-08-25
**Problem:** MBS XML file appears to be in Excel XML format rather than standard XML
**Impact:** May need special parsing approach
**Solution:** Successfully parsed using xml.etree.ElementTree with iterparse for memory efficiency
**Resolution:** The MBS-XML-20250101.xml file is proper XML format with <MBS_XML><Data> structure

## [RESOLVED] Virtual Environment Conflict
**Date:** 2025-08-25
**Problem:** UV was trying to use the global lewagon virtual environment instead of project-specific one
**Impact:** Dependencies couldn't install properly, torch download kept timing out
**Solution:** Created fresh .venv with `uv venv` and properly activated it
**Resolution:** All dependencies installed successfully, pipeline fully functional

## [RESOLVED] Missing idna Dependency
**Date:** 2025-08-25
**Problem:** sentence-transformers had undeclared dependency on idna module
**Impact:** Import errors when trying to use sentence-transformers
**Solution:** Added idna to dependencies with `uv add idna`
**Resolution:** All imports working correctly

## [RESOLVED] Test Coverage Reporting
**Date:** 2025-08-25
**Problem:** Test coverage showing low percentage (~18%) despite comprehensive test suite
**Impact:** Difficult to assess actual test coverage and identify gaps
**Solution:** Issue with imports and test discovery, fixed import paths in test files
**Resolution:** Tests running properly, coverage can now be accurately measured

## [RESOLVED] API Response Field Naming
**Date:** 2025-08-25  
**Problem:** Inconsistent field naming between API models (fee vs schedule_fee)
**Impact:** Integration tests failing due to field mismatch
**Solution:** Standardized on schedule_fee throughout codebase
**Resolution:** All tests passing with consistent field naming

## [RESOLVED] Production Embeddings Performance Issue
**Date:** 2025-08-26
**Problem:** Runtime embeddings computation on Cloud Run CPU taking 17+ seconds, causing API timeouts
**Impact:** Production API requests timing out, category-aware features not usable
**Solution:** Pre-compute embeddings locally with MacBook MPS acceleration, include in Docker image
**Resolution:** Embeddings load in 0.031s vs 17s (99.8% improvement), API fully functional

## [RESOLVED] OpenAI Provider Method Missing
**Date:** 2025-08-26
**Problem:** mbs_categorizer.py calling provider.generate() but OpenAIProvider only had get_reasoning() method
**Impact:** LLM categorization failing, falling back to rule-based only
**Solution:** Added generate() method to OpenAIProvider for compatibility
**Resolution:** LLM categorization now working, both methods available

---
*Note: Mark blockers as [RESOLVED] when solution is implemented*