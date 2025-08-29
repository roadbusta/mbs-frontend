# AutoMBS: AI-Powered Medicare Benefits Schedule Coding Assistant

*AI NextGen Challenge - NexuMD Submission*

## Executive Summary

AutoMBS is a proof-of-concept AI system developed during a time-constrained hackathon to demonstrate automated MBS code selection from clinical documentation. The system showcases a 5-stage AI pipeline that processes consultation notes and suggests appropriate MBS billing codes with reasoning and confidence scores.

Built with React TypeScript frontend and Python FastAPI backend, this prototype demonstrates the feasibility of AI-assisted Medicare billing code selection for Australian healthcare providers.

## Problem Statement

Healthcare providers in Australia face significant challenges with MBS coding:

- **Manual Process**: Current MBS code selection is entirely manual, requiring extensive medical billing knowledge
- **Time Consuming**: Staff spend considerable time researching appropriate codes for each consultation
- **Error Prone**: Manual selection leads to coding errors, claim rejections, and potential compliance issues
- **Resource Intensive**: Requires specialized billing expertise that may not be available in all practices
- **Complexity**: 5,964+ MBS codes across multiple categories with complex eligibility rules

## Solution Overview

AutoMBS provides an intelligent, end-to-end system that:

1. **Ingests clinical documentation** via a user-friendly web interface
2. **Applies comprehensive MBS knowledge base** with real-time processing
3. **Generates candidate MBS codes** using AI-powered analysis
4. **Provides detailed reasoning** for each recommendation
5. **Includes confidence scores** for decision support
6. **Validates compliance** against Additional Notes rules

### Core Technology Stack

**Frontend:**
- React 18 with TypeScript for type safety
- Vite 5 for fast development and building
- Axios for API communication
- Responsive design for desktop and mobile

**Backend:**
- Python 3.13 with FastAPI for high-performance APIs
- OpenAI GPT-4o-mini for medical reasoning
- Sentence Transformers for semantic understanding
- Comprehensive caching and optimization

**Deployment:**
- Docker containerization
- Google Cloud Run for scalable hosting
- Automated CI/CD pipeline ready

## How the System Works

### 5-Stage AI Pipeline

1. **Stage 0: Intelligent Categorization**
   - LLM analyzes consultation context (GP, ED, specialist, etc.)
   - Reduces search space by 75-90% (6,000 → 600-1,500 codes)
   - Rule-based fallback for reliability

2. **Stage 1: TF-IDF Text Filtering**
   - Extracts medical terms using regex patterns
   - Performs text similarity matching
   - Reduces to top 50 candidates (0.001s after caching)

3. **Stage 2: Semantic Embedding Ranking**
   - Uses pre-computed medical language model embeddings
   - Performs semantic similarity analysis
   - Narrows to top 20 candidates (<500ms)

4. **Stage 3: LLM Medical Reasoning**
   - GPT-4o-mini applies medical billing expertise
   - Considers Additional Notes compliance rules
   - Provides detailed medical justification
   - Generates final 3-5 recommendations (10-30s)

5. **Stage 4: Compliance Validation**
   - Validates age restrictions and setting requirements
   - Checks co-claim rules and exclusions
   - Adds compliance warnings where applicable
   - Enriches recommendations with eligibility status

### Performance (Prototype Testing)

- **Processing Time**: 10-30 seconds for new requests, <100ms for cached responses
- **LLM Confidence**: ~80% average self-assessed confidence scores
- **Coverage**: 5,964 MBS codes across all medical categories
- **Test Coverage**: Comprehensive unit tests for core functionality

*Note: Performance metrics are from limited prototype testing, not production validation*

## How to Use AutoMBS

### For Healthcare Providers

1. **Access the System**
   - Navigate to the web interface
   - No authentication currently required (planned for production)

2. **Submit Consultation Notes**
   - Enter clinical documentation (10-10,000 characters)
   - Select consultation context (GP, ED, specialist, etc.)
   - Configure options (max codes, confidence threshold)

3. **Review Recommendations**
   - Examine suggested MBS codes with confidence scores
   - Read detailed medical reasoning for each recommendation
   - Check compliance warnings and eligibility status
   - Access direct links to MBS Online for official descriptions

4. **Make Informed Decisions**
   - Use AI recommendations as decision support
   - Apply professional medical billing expertise
   - Verify all codes before submission to Medicare

### For Developers

1. **API Integration**
   ```bash
   curl -X POST "https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/v1/analyze" \
     -H "Content-Type: application/json" \
     -d '{
       "consultation_note": "45-minute comprehensive consultation...",
       "options": {"max_codes": 5, "min_confidence": 0.6}
     }'
   ```

2. **Local Development**
   ```bash
   # Backend
   uv sync && uv run uvicorn src.api.main:app --reload
   
   # Frontend
   npm install && npm run dev
   ```

## Current Capabilities (Prototype)

### ✅ Hackathon Achievements

- **MBS Data Processing**: Successfully parsed and indexed 5,964 MBS codes from official XML
- **AI Pipeline**: Implemented 5-stage processing (categorization, TF-IDF, embeddings, LLM reasoning, validation)
- **Web Interface**: Functional React frontend for consultation note input and results display
- **API Integration**: RESTful API with FastAPI backend deployed to Google Cloud Run
- **Medical Reasoning**: LLM-generated explanations for code recommendations with confidence scores
- **Basic Compliance**: Initial Additional Notes parsing for age/setting restrictions

### 🎯 Challenge Requirements Demonstrated

- ✅ **Proof of concept** end-to-end system
- ✅ **MBS knowledge base** with structured data processing
- ✅ **AI-powered suggestions** with reasoning and confidence scores
- ✅ **Multiple consultation types** (GP, ED, specialist scenarios)
- ✅ **Explainable recommendations** through detailed LLM reasoning
- ✅ **Working web interface** and API integration

### 🚧 Prototype Limitations

- **No ground truth validation** - accuracy not verified against expert billing decisions
- **Limited real-world testing** - tested primarily on synthetic consultation notes
- **Basic compliance checking** - Additional Notes processing is incomplete
- **No user authentication** or multi-tenancy support
- **Simplified error handling** and monitoring

## Immediate Next Steps

Given the hackathon's time constraints, the following priorities would transform this prototype into a viable product:

### 🎯 Critical Priorities (Next 1-2 Months)

**1. Validation & Testing**
- Create ground truth dataset with medical billing experts (100-200 validated cases)
- Measure actual accuracy against expert decisions, not just LLM confidence scores
- Test with real consultation notes from healthcare providers
- Implement user feedback collection mechanism

**2. Complete MBS Rule Processing**
- Finish parsing complex Additional Notes rules (frequency limits, co-claims, etc.)
- Add comprehensive age/setting/provider type validation
- Implement temporal billing restrictions (e.g., once per year limits)
- Build rule conflict detection and resolution

**3. Production Infrastructure**
- Add proper error handling and logging
- Implement user authentication and basic access control  
- Set up monitoring and alerting for system health
- Create proper database for caching vs. current file-based approach
- Add rate limiting and basic security measures

### 🔧 Technical Improvements (Month 2-3)

**4. Enhanced AI Pipeline**
- Improve subcategory filtering for better code targeting
- Add evidence highlighting in consultation text
- Optimize processing time for real-world usage patterns
- Implement fallback strategies when components fail

**5. User Experience**
- Add batch processing for multiple consultations
- Improve results visualization and comparison
- Create export functionality (PDF reports, CSV lists)
- Add consultation note templates and examples

**6. Basic Integration**
- Create simple API for practice management software integration
- Add webhook support for automated billing workflows
- Build basic FHIR compatibility for EMR systems

### 📋 Success Metrics

**Short-term (3 months):**
- Achieve >90% accuracy on ground truth validation set
- Reduce average consultation coding time from 15-20 minutes to <5 minutes
- Successfully integrate with at least 2 practice management systems
- Onboard 5-10 pilot healthcare practices

**Long-term (12 months):**
- Demonstrate measurable reduction in claim rejection rates
- Scale to 100+ healthcare providers
- Build sustainable revenue model and business case

## Conclusion

AutoMBS demonstrates the feasibility of AI-assisted Medicare billing code selection, successfully meeting the AI NextGen Challenge requirements within the hackathon timeframe. This prototype showcases a working end-to-end system with AI-powered MBS code recommendations, medical reasoning, and basic compliance checking.

**Key Achievements:**
- Functional 5-stage AI pipeline processing 5,964 MBS codes
- Working web interface and API integration
- Deployed proof-of-concept on Google Cloud Run
- Demonstrated explainable AI recommendations with confidence scores

**Critical Next Steps:**
The prototype requires validation against ground truth expert decisions, complete MBS rule implementation, and production infrastructure before real-world deployment. Success depends on transforming promising hackathon results into a validated, reliable healthcare tool.

The modular architecture provides a foundation for continued development, with clear priorities focused on accuracy validation, regulatory compliance, and user experience improvements.

---

*Developed during AI NextGen Challenge hackathon - December 2024*