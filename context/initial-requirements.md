# AutoMBS — AI-Powered Medicare Benefits Schedule Coding Assistant

**Presented by:** NexusMD

## Challenge Overview

The Medicare Benefits Schedule (MBS) is a comprehensive list of medical services subsidised by the Australian Government. Each service has:
- An unique item number
- A description
- Clinical use requirements
- Associated rules (e.g., frequency limits, combinations allowed/disallowed, special conditions for eligibility)

Correctly selecting the right MBS item code(s) from clinical documentation is critical for:
- Accurate billing
- Compliance with government regulations
- Maximising reimbursement without violating policy

Manual MBS coding is time-consuming and error-prone, especially when multiple services are provided in one episode of care.

## Key Objectives

Build an AI-assisted coding tool that automatically:
1. Suggests appropriate MBS item numbers from clinical notes
2. Explains its reasoning
3. Estimates confidence
4. Focuses on accuracy and coverage

## Mission Goals

An end-to-end system that:
1. Ingests clinical documentation from simulated patient encounters
2. Applies an MBS knowledge base
3. Generates candidate MBS item numbers with:
   - Reasoning
   - Evidence from the note
   - Confidence score
4. Supports multiple service scenarios
5. Measures accuracy and coverage

## Challenge Scope

Focus on 8–12 common and diverse MBS categories, including:
- GP attendances
- Specialist consultations
- Pathology services
- Diagnostic imaging
- Minor procedures
- Telehealth consultations
- ECG, spirometry
- Allied health items (optional)

## Inputs & Data Preparation

### Required:
- Synthetic episodes with realistic clinical notes
- Multiple service combinations
- Variation in wording

### Optional Multimodal:
- Mock attachments
- Structured test data in JSON

## Knowledge & Rules

- Use MBS Online as official reference
- Extract item numbers, descriptions, eligibility requirements
- Create structured knowledge base
- Encode rule snippets
- Support combination logic

## System Requirements

### Core Functional Requirements:
1. **Code Suggestion API** (/mbs-codes)
2. **Explainability** - Clear reasoning for suggestions
3. **Coverage Tracking** - Track which MBS items are supported
4. **Accuracy Tracking** - Measure performance metrics
5. **Test Automation** - Automated validation framework

## Prompt Engineering & Model Strategy

1. Prompt Templates
2. Hot-reload capability
3. Metrics logging

## Suggested Architecture

### 1. Ingestion Layer
- FastAPI (Python) or Node/Express
- JSON/FHIR parsing preferred

### 2. Knowledge Management
- YAML/JSON rules database
- Small rules evaluation engine
- Structured knowledge base of MBS item details

### 3. NLP/Machine Learning Approach
- **Baseline:** Keyword/regex matching
- **Practical Options:**
  - Small open models (7-13B) for entity extraction
  - Hosted API options
- Retrieval-Augmented Generation (RAG) with embedded rule snippets

### 4. Storage
- Lightweight database (SQLite/Postgres)
- Store prompts, rules, logs

### 5. User Interface
- Minimal web interface
- Upload/select clinical episodes
- Display outputs and explanations

### 6. Testing Framework
- Pytest/Playwright
- GitHub Actions integration

## Technical Specifications

### Core System Components:
- Code Suggestion API endpoint
- Explainable AI outputs with reasoning
- Coverage and accuracy tracking mechanisms
- Automated validation and testing
- Prompt engineering capabilities with hot-reload

### Implementation Notes:
- Partial implementation acceptable
- Focus on accuracy over breadth
- Emphasis on transparency and explainability

## Prize

- **A$800 cash**
- **Full-time job opportunities**

## Contact Information

- **Email:** ai_development_group@outlook.com
- **Phone:** 0413678116

## Additional Notes

The challenge emphasizes creating an AI system that can accurately and transparently suggest Medicare Benefits Schedule item numbers from clinical documentation, with a focus on practical implementation and real-world applicability.