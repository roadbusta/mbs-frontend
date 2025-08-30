# MBS Code Selection with Conflict Detection - Wireframe & Implementation Plan

## 🎯 Overview
Design and implement a comprehensive MBS code selection system that allows users to select multiple MBS codes while preventing conflicts through intelligent validation and visual feedback.

## 📋 Current State Analysis
- ✅ MBS cards display individual recommendations with confidence scores
- ✅ Cards show: rank, code, description, confidence, fee, reasoning
- ✅ Actions: copy, view MBS online, feedback
- ❌ No selection mechanism
- ❌ No conflict detection
- ❌ No multi-selection capability

## 🎨 Wireframe Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     MBS Code Recommendations                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Found 3 recommendations                        [Selection Summary] [Export]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌─ Selection Summary Bar ────────────────────────────────────────────────┐   │
│ │ 🔹 Selected: 2 codes │ 💰 Total Fee: $125.10 │ ⚠️ 1 Conflict         │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌─ MBS Code Card #1 [SELECTED] ─────────────────────────────────────────┐   │
│ │ ☑️ #1  36 - Level C consultation 40+ minutes        🟢 High (85%)    │   │
│ │      Professional Attendances                        💰 $75.05       │   │
│ │                                                                      │   │
│ │ ✅ Compatible with: 177, 721                                          │   │
│ │ ⚠️  Conflicts with: 23, 44 (Time overlap)                             │   │
│ │                                                                      │   │
│ │ [Medical Reasoning ▼] [📋 Copy] [🔗 MBS] [💬 Feedback] [🔄 Toggle]   │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌─ MBS Code Card #2 [AVAILABLE] ────────────────────────────────────────┐   │
│ │ ⬜ #2  177 - Basic consultation                      🟡 Medium (65%)  │   │
│ │      Professional Attendances                        💰 $45.05       │   │
│ │                                                                      │   │
│ │ ✅ Compatible with: 36, 721                                           │   │
│ │ ❌ Cannot select: Conflicts with selected code 36                     │   │
│ │                                                                      │   │
│ │ [Medical Reasoning ▼] [📋 Copy] [🔗 MBS] [💬 Feedback] [➕ Select]    │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│ ┌─ MBS Code Card #3 [BLOCKED] ──────────────────────────────────────────┐   │
│ │ 🚫 #3  23 - Brief consultation                      🔴 Low (45%)     │   │
│ │      Professional Attendances                        💰 $25.05       │   │
│ │                                                                      │   │
│ │ 🚫 BLOCKED: Time conflict with selected code 36                       │   │
│ │ 💡 Suggestion: Deselect code 36 to enable this option                 │   │
│ │                                                                      │   │
│ │ [Medical Reasoning ▼] [📋 Copy] [🔗 MBS] [💬 Feedback] [🚫 Blocked]  │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual States

#### 1. Unselected State (Default)
- **Background**: White
- **Border**: 2px solid #e5e7eb (gray-200)
- **Checkbox**: Empty square ⬜
- **Action Button**: "➕ Select" (green)

#### 2. Selected State
- **Background**: Light blue (#f0f9ff)
- **Border**: 2px solid #3b82f6 (blue-500)
- **Checkbox**: Filled checkmark ☑️
- **Action Button**: "🔄 Toggle" (blue)
- **Selection Badge**: "SELECTED" (top-right)

#### 3. Compatible State (when other codes selected)
- **Background**: Light green tint (#f0fdf4)
- **Compatibility Indicator**: "✅ Compatible with: [codes]"
- **Action Button**: "➕ Select" (enabled)

#### 4. Conflict State (cannot select)
- **Background**: Light orange/yellow (#fffbeb)
- **Border**: 2px solid #f59e0b (amber-500)
- **Checkbox**: Warning symbol ⚠️
- **Conflict Indicator**: "⚠️ Conflicts with: [codes] ([reason])"
- **Action Button**: "⚠️ Conflict" (disabled, amber)

#### 5. Blocked State (hard conflict)
- **Background**: Light red (#fef2f2)
- **Border**: 2px solid #ef4444 (red-500)
- **Checkbox**: Blocked symbol 🚫
- **Block Indicator**: "🚫 BLOCKED: [reason]"
- **Suggestion**: "💡 Suggestion: [action to resolve]"
- **Action Button**: "🚫 Blocked" (disabled, red)

## 🔧 Technical Implementation Plan

### Phase 1: Data Structure Enhancement

#### API Response Updates
```typescript
interface CodeRecommendation {
  // Existing fields...
  code: string;
  description: string;
  confidence: number;
  fee: number;
  reasoning: string;
  
  // New fields for conflict detection
  conflicts: ConflictRule[];
  compatibleWith: string[];
  category: MBSCategory;
  timeRequirement?: number; // minutes
  exclusionRules?: ExclusionRule[];
}

interface ConflictRule {
  conflictingCodes: string[];
  reason: ConflictReason;
  severity: 'warning' | 'blocking';
  message: string;
}

type ConflictReason = 
  | 'time_overlap'        // Cannot bill both in same consultation
  | 'category_exclusive'  // Only one from category allowed
  | 'age_restriction'     // Age-based conflicts
  | 'frequency_limit'     // Daily/weekly limits
  | 'prerequisite_missing' // Requires another code first
  | 'medicare_rule';      // General Medicare billing rules

interface SelectionState {
  selectedCodes: Set<string>;
  conflicts: Map<string, ConflictRule[]>;
  totalFee: number;
  warnings: string[];
}
```

#### State Management
```typescript
// Add to App.tsx or create dedicated hook
const useCodeSelection = () => {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [conflicts, setConflicts] = useState<Map<string, ConflictRule[]>>(new Map());
  
  const toggleCodeSelection = (code: string, recommendation: CodeRecommendation) => {
    // Logic for selection with conflict validation
  };
  
  const validateSelection = (codes: Set<string>) => {
    // Comprehensive conflict validation
  };
  
  return { selectedCodes, conflicts, toggleCodeSelection, validateSelection };
};
```

### Phase 2: UI Component Updates

#### Enhanced MBS Card Component
```typescript
interface MBSCodeCardProps {
  // Existing props...
  
  // New selection props
  isSelected: boolean;
  selectionState: 'available' | 'compatible' | 'conflict' | 'blocked';
  conflicts: ConflictRule[];
  compatibleCodes: string[];
  onToggleSelection: (code: string) => void;
}
```

#### New Components to Create

1. **SelectionSummaryBar**
   - Shows selected count, total fee, conflicts
   - Export functionality
   - Clear all selection

2. **ConflictIndicator**
   - Visual conflict warnings
   - Detailed conflict explanations
   - Resolution suggestions

3. **CompatibilityBadge**
   - Shows compatible codes
   - Green checkmark styling

### Phase 3: Conflict Detection Engine

#### Core Conflict Rules
```typescript
const CONFLICT_RULES: ConflictRule[] = [
  {
    conflictingCodes: ['36', '44'], // Level C and D consultations
    reason: 'time_overlap',
    severity: 'blocking',
    message: 'Cannot bill multiple consultation levels for same patient visit'
  },
  {
    conflictingCodes: ['177', '179'], // Basic consultations
    reason: 'category_exclusive', 
    severity: 'blocking',
    message: 'Only one basic consultation can be billed per visit'
  },
  {
    conflictingCodes: ['721', '723'], // Mental health items
    reason: 'frequency_limit',
    severity: 'warning',
    message: 'Consider frequency limits for mental health consultations'
  }
];
```

#### Validation Logic
```typescript
const detectConflicts = (
  selectedCodes: Set<string>,
  newCode: string,
  allRecommendations: CodeRecommendation[]
): ConflictValidation => {
  const conflicts: ConflictRule[] = [];
  const warnings: string[] = [];
  
  // Check against each conflict rule
  for (const rule of CONFLICT_RULES) {
    if (rule.conflictingCodes.includes(newCode)) {
      const hasConflict = Array.from(selectedCodes).some(code => 
        rule.conflictingCodes.includes(code)
      );
      
      if (hasConflict) {
        conflicts.push(rule);
        if (rule.severity === 'blocking') {
          return { canSelect: false, conflicts, warnings };
        } else {
          warnings.push(rule.message);
        }
      }
    }
  }
  
  return { canSelect: true, conflicts: [], warnings };
};
```

### Phase 4: Enhanced User Experience

#### Selection Summary Component
```tsx
const SelectionSummary: React.FC<{
  selectedCodes: Set<string>;
  totalFee: number;
  conflicts: ConflictRule[];
}> = ({ selectedCodes, totalFee, conflicts }) => (
  <div className="selection-summary">
    <div className="summary-stats">
      <span>🔹 Selected: {selectedCodes.size} codes</span>
      <span>💰 Total Fee: ${totalFee.toFixed(2)}</span>
      {conflicts.length > 0 && (
        <span className="conflicts">⚠️ {conflicts.length} Conflicts</span>
      )}
    </div>
    <div className="summary-actions">
      <button onClick={handleExport}>Export Selection</button>
      <button onClick={handleClearAll}>Clear All</button>
    </div>
  </div>
);
```

#### Export Functionality
- **PDF Export**: Selected codes with details
- **CSV Export**: For billing systems
- **Print View**: Professional consultation summary
- **Copy to Clipboard**: Quick code list

## 🎨 CSS Styling Plan

### New CSS Classes
```css
/* Selection States */
.mbs-card.selected {
  background: #f0f9ff;
  border: 2px solid #3b82f6;
}

.mbs-card.compatible {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
}

.mbs-card.conflict {
  background: #fffbeb;
  border: 2px solid #f59e0b;
}

.mbs-card.blocked {
  background: #fef2f2;
  border: 2px solid #ef4444;
  opacity: 0.8;
}

/* Selection Controls */
.selection-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
}

.selection-checkbox.checked {
  background: #3b82f6;
  border-color: #3b82f6;
}

.selection-checkbox.blocked {
  background: #ef4444;
  border-color: #ef4444;
}

/* Conflict Indicators */
.conflict-indicator {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  margin: 8px 0;
}

.conflict-indicator.warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.conflict-indicator.blocking {
  background: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

/* Selection Summary Bar */
.selection-summary {
  background: #f8fafc;
  padding: 16px 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.summary-stats {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.summary-stats .conflicts {
  color: #f59e0b;
  font-weight: 600;
}
```

## 🧪 Testing Strategy

### Unit Tests
- Conflict detection logic
- Selection state management
- UI component interactions

### Integration Tests  
- End-to-end selection flow
- Export functionality
- Conflict resolution

### User Acceptance Tests
- Medical coding workflow scenarios
- Multi-code selection patterns
- Conflict handling user experience

## 📈 Implementation Timeline

### Week 1: Foundation
- [ ] Update TypeScript interfaces
- [ ] Create conflict detection engine
- [ ] Implement selection state management

### Week 2: UI Components
- [ ] Enhance MBSCodeCard with selection
- [ ] Create SelectionSummaryBar
- [ ] Add conflict indicators

### Week 3: Advanced Features
- [ ] Export functionality
- [ ] Advanced conflict rules
- [ ] Accessibility improvements

### Week 4: Testing & Polish
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation updates

## 💡 Future Enhancements

1. **AI-Powered Suggestions**
   - Smart conflict resolution recommendations
   - Alternative code suggestions
   - Pattern recognition for common selections

2. **Batch Operations**
   - Select all compatible codes
   - Bulk conflict resolution
   - Template-based selections

3. **Integration Features**
   - Save selection templates
   - Integration with practice management systems
   - Audit trail for selections

4. **Advanced Analytics**
   - Selection pattern analysis
   - Fee optimization suggestions
   - Compliance checking

This comprehensive plan provides a robust foundation for implementing MBS code selection with intelligent conflict detection while maintaining professional medical-grade UX standards.