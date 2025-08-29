# MBS Frontend - Improved Layout Wireframe

## Current Issues Identified
1. **Gaps in spacing**: Large gap between description text and dropdown
2. **Linear layout**: Everything stacked vertically makes it feel long
3. **Analysis section**: Buttons feel disconnected from input area

## Proposed Side-by-Side Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ MBS Consultation Note Analysis                                                 │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┬──────────────────────────────────────┐
│                                         │                                      │
│ LEFT PANEL - INPUT SECTION             │ RIGHT PANEL - ANALYSIS SECTION      │
│                                         │                                      │
│ Enter consultation note and select      │ ┌──────────────────────────────────┐ │
│ appropriate context to receive AI-      │ │ 📋 Ready to Analyze              │ │
│ powered MBS code recommendations.       │ │                                  │ │
│                                         │ │ Status: Waiting for input...     │ │
│ Consultation Context: [Dropdown ▼]     │ │                                  │ │
│                                         │ │ Requirements:                    │ │
│ Consultation Note:                      │ │ ✓ Context selected               │ │
│ ┌─────────────────────────────────────┐ │ │ ○ Min 10 characters (0/10)       │ │
│ │ Enter consultation note here...     │ │ │                                  │ │
│ │                                     │ │ │ [🔍 Analyze Consultation]        │ │
│ │                                     │ │ │ [🗑️  Clear Input]                │ │
│ │                                     │ │ │                                  │ │
│ │                                     │ │ │ 💡 Tip: Include duration,        │ │
│ │                                     │ │ │ symptoms, examination findings   │ │
│ │                                     │ │ │ for better results.              │ │
│ │                                     │ │ └──────────────────────────────────┘ │
│ │                                     │ │                                      │
│ │                                     │ │ ┌──────────────────────────────────┐ │
│ │                                     │ │ │ 📊 Analysis Progress             │ │
│ │                                     │ │ │                                  │ │
│ │                     [450/10000]     │ │ │ (Shows when analyzing)           │ │
│ └─────────────────────────────────────┘ │ │ Processing...                    │ │
│                                         │ │ ⏳ Analyzing consultation         │ │
│                                         │ │ 🔍 Finding relevant codes        │ │
│                                         │ │ ✨ Generating recommendations   │ │
│                                         │ └──────────────────────────────────┘ │
│                                         │                                      │
└─────────────────────────────────────────┴──────────────────────────────────────┘
```

## Benefits of New Layout

### 🚀 **Improved User Experience**
- **Visual Balance**: Side-by-side layout feels more modern and efficient
- **Reduced Scrolling**: All key actions visible without scrolling
- **Clear Flow**: Left-to-right progression (input → analysis → results)

### 📱 **Better Information Architecture**
- **Status Clarity**: Real-time feedback on readiness to analyze
- **Progress Tracking**: Visual indicators for analysis progress
- **Contextual Help**: Tips and requirements stay visible while typing

### ⚡ **Enhanced Workflow**
- **Faster Interaction**: Analysis controls always in view
- **Better Feedback**: Live status updates on input requirements
- **Professional Feel**: Matches medical software design patterns

## Responsive Behavior

### Desktop (≥1200px)
```
[Input Panel 60%] [Analysis Panel 40%]
```

### Tablet (768px - 1199px)  
```
[Input Panel 65%] [Analysis Panel 35%]
```

### Mobile (<768px)
```
[Input Panel - Full Width]
[Analysis Panel - Full Width]
(Stacked vertically)
```

## Technical Implementation Plan

### 1. CSS Grid Layout
```css
.consultation-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .consultation-layout {
    grid-template-columns: 1fr 350px;
  }
}

@media (max-width: 768px) {
  .consultation-layout {
    grid-template-columns: 1fr;
  }
}
```

### 2. Analysis Card Component
```typescript
interface AnalysisCardProps {
  isReady: boolean;
  characterCount: number;
  minCharacters: number;
  contextSelected: boolean;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClear: () => void;
}
```

### 3. Real-time Status Updates
- ✅ Context selected indicator
- ✅ Character count progress
- ✅ Ready state visualization
- ⏳ Analysis progress states

## Visual Design Elements

### 🎨 **Card Styling**
- **Analysis Card**: Subtle background with border
- **Status Icons**: Visual feedback for each requirement
- **Progress Bar**: For character count and analysis progress
- **Button States**: Clear enabled/disabled visual cues

### 🎯 **Interaction Design**
- **Hover Effects**: Subtle animations on interactive elements
- **Focus States**: Clear keyboard navigation
- **Loading States**: Smooth transitions during analysis

## User Journey Enhancement

### Before Analysis
1. User sees clear layout with input on left, analysis card on right
2. Context selector has proper label and description
3. Analysis card shows requirements checklist
4. Tips and help text always visible

### During Input
1. Real-time character count updates
2. Requirement checklist updates dynamically
3. Analyze button enables when ready
4. Visual feedback for validation states

### During Analysis
1. Analysis card shows progress indicators
2. Input section stays visible but disabled
3. Clear loading states and progress feedback
4. Professional, medical-grade experience

This layout transforms the current linear flow into a more efficient, professional interface that reduces cognitive load and provides better visual hierarchy.