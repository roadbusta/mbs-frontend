# MBS Coding Assistant - Feature Documentation

## 🎯 Core Features

### 1. Evidence-Based Code Recommendations

**What it does**: Shows exactly which parts of the consultation text led to each MBS code recommendation through interactive highlighting.

**How it works**:
- Enter consultation text in the main textarea
- Select appropriate consultation context (GP, ED, Specialist, etc.)
- Click "Analyze" to get AI-powered recommendations
- **Hover over MBS code cards** → corresponding text highlights in the consultation note
- **Hover over highlighted text** → shows which MBS code it relates to
- Each code gets a unique color for visual connection

**Example**: 
If text says "chest pain and shortness of breath", this might highlight in blue and connect to MBS Code 23 (Level B consultation) also shown in blue.

### 2. Consultation Context Selection

**Available Contexts**:
- **General Practice** - Standard GP consultation (Level A, B, C, D consultations)
- **Emergency Department** - Hospital emergency department consultation  
- **Specialist Consultation** - Specialist referral (cardiology, endocrinology, etc.)
- **Mental Health** - Mental health care plan or psychological consultation
- **Telehealth** - Video or phone consultation
- **Other** - Other consultation type not listed above

**Why it matters**: Context helps the AI backend provide more accurate MBS code recommendations by understanding the clinical setting.

### 3. Professional Code Display

**Code Information Shown**:
- **MBS Item Number** (e.g., "23", "36", "177")
- **Official Description** from MBS database
- **Confidence Score** (High/Medium/Low with color coding)
- **Schedule Fee** in AUD (official government rates)
- **AI Reasoning** explaining why the code was recommended
- **Direct Link** to MBS Online government database

**Actions Available**:
- **Copy Code** - One-click copy to clipboard
- **View on MBS Online** - Opens official government page
- **See Evidence** - Hover to highlight supporting text

### 4. Input Validation & Guidance

**Text Requirements**:
- **Minimum**: 10 characters required
- **Maximum**: 10,000 characters allowed  
- **Real-time Counter**: Shows character count as you type
- **Validation Messages**: Clear feedback for invalid input

**User Guidance**:
- Context selection dropdown with descriptions
- Processing time estimates (6-30 seconds typical)
- Loading states with progress indicators
- Error messages with suggested actions

### 5. Advanced Processing Insights

**Metadata Available** (Toggle to view):
- **Processing Time** - How long the AI analysis took
- **Pipeline Stages** - Technical breakdown of analysis steps
  - TF-IDF Candidates: Initial text matching results
  - Embedding Candidates: AI semantic similarity matches
  - LLM Analyzed: Final AI reasoning stage
- **Model Used** - AI model information (typically GPT-4o-mini)
- **Categorization Details** - How the AI categorized the consultation
- **Reduction Percentage** - How many codes were filtered out

## 🖱️ User Workflow

### Step 1: Select Context
Choose the appropriate consultation type from the dropdown above the text area.

### Step 2: Enter Consultation Note  
Type or paste the consultation text. Must be 10-10,000 characters.

### Step 3: Analyze
Click "Analyze Consultation" button. Processing typically takes 6-30 seconds.

### Step 4: Review Recommendations
- **Scan the code cards** for relevant MBS items
- **Hover over codes** to see which text led to each recommendation
- **Check confidence levels** (high/medium/low color coding)
- **Review AI reasoning** for each code

### Step 5: Use Results
- **Copy codes** for billing systems
- **Visit MBS Online** for official details  
- **Review schedule fees** for billing amounts
- **Clear and start again** for next consultation

## 🎨 Visual Design Features

### Color-Coded System
- **Blue (#0066CC)** - Primary actions, high-priority information
- **Green (#10B981)** - High confidence, success states
- **Amber (#F59E0B)** - Medium confidence, warnings
- **Red (#EF4444)** - Low confidence, errors
- **Evidence Colors** - 8 distinct colors for text highlighting

### Interactive Elements
- **Hover Effects** - Cards lift slightly, colors intensify
- **Loading Animations** - Smooth skeleton screens during analysis
- **Micro-interactions** - Button presses, form validation feedback
- **Responsive Design** - Works on desktop, tablet, and mobile

### Professional Medical Theming
- **Clean Card Layout** - Information organized in scannable cards
- **Medical Typography** - Professional fonts optimized for clinical text
- **Status Indicators** - Live API connection status shown in header
- **Accessibility** - ARIA labels, keyboard navigation, high contrast support

## 🔧 Technical Features

### Performance Optimizations
- **Code Splitting** - React and form libraries loaded separately
- **Bundle Size** - Optimized 243KB total (very fast loading)
- **Source Maps** - Available for debugging
- **Hot Reload** - Instant updates during development

### Error Handling
- **Network Issues** - Graceful handling of connection problems
- **API Errors** - Clear messages for server issues
- **Validation** - Real-time input validation with helpful messages
- **Timeout Management** - Handles long-running AI analysis

### Development Features
- **TypeScript** - Full type safety throughout application
- **Live Reload** - Changes appear instantly during development  
- **API Logging** - Request/response logging in browser console
- **Build Validation** - Ensures production readiness

## 🚧 Development Status

Core features are **implemented and functional** in development environment:
- ✅ Live API integration connected
- ✅ Evidence highlighting implemented
- ✅ Context selection functional  
- ✅ Error handling in place
- ✅ Medical interface designed
- ✅ Responsive layout working
- ✅ Development build stable

**Current Status**: Undergoing iterative testing and refinement before production deployment.

---

*Feature documentation updated: 2025-08-27*