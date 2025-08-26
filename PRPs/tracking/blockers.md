# Blockers Log

## [ACTIVE] Frontend Testing Coverage Requirements
**Date:** 2025-08-27
**Problem:** Need to set up comprehensive testing infrastructure for React components
**Impact:** Cannot ensure component reliability without proper test coverage
**Solution:** Will implement Vitest with React Testing Library in Hour 7

## [ACTIVE] CORS Configuration for Local Development
**Date:** 2025-08-27  
**Problem:** May encounter CORS issues when frontend on localhost:5173 calls backend API
**Impact:** Could block local development if not properly configured
**Solution:** Backend already has CORS configured for localhost:5173, Vite proxy as fallback

---

## Previously Resolved (Backend-related)

## [RESOLVED] MBS Additional Notes Complexity
**Date:** 2025-08-25
**Problem:** The Additional Notes (AN) in MBS codes contain complex eligibility criteria that are difficult to parse programmatically
**Impact:** May affect accuracy of code recommendations in Phase 1 MVP
**Solution:** Deferred AN processing to Phase 2, focus on basic descriptions for MVP
**Resolution:** MVP successfully deployed without AN processing, accuracy acceptable

## [RESOLVED] GCP Cloud Run Cold Start Performance
**Date:** 2025-08-25
**Problem:** Cloud Run container takes 60-90 seconds to cold start due to sentence-transformers model loading
**Impact:** First API calls after idle periods experience significant latency
**Solution:** Set minimum instances to 1 to keep at least one instance warm
**Resolution:** Production deployment configured with warm instances, 5-minute timeout

## [RESOLVED] Production Embeddings Performance Issue
**Date:** 2025-08-26
**Problem:** Runtime embeddings computation on Cloud Run CPU taking 17+ seconds
**Impact:** Production API requests timing out
**Solution:** Pre-compute embeddings locally with MacBook MPS acceleration
**Resolution:** Embeddings load in 0.031s vs 17s (99.8% improvement)

---
*Note: Mark blockers as [RESOLVED] when solution is implemented*