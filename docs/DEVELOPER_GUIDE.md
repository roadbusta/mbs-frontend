## Developer Guide

### Overview
This frontend is a React + Vite + TypeScript app providing an enhanced UI for viewing and selecting MBS code recommendations with filters, bulk operations, and exports.

### Prerequisites
- Node.js 18+
- pnpm, npm, or yarn (examples use npm)

### Setup
1) Install deps:
```
npm install
```
2) Start dev server:
```
npm run dev
```
3) Run tests:
```
npm test
```
4) Type-check and lint:
```
npm run type-check
npm run lint
```

### Project Structure (selected)
- `src/components/ResultsDisplay/` — results cards, processing metadata
- `src/components/EnhancedToolbar/` — bulk ops, filters, export, history
- `src/hooks/` — selection, UX, and management hooks
- `src/services/` — export/reporting services
- `docs/` — implementation notes and this guide

### Using the Frontend
1) Provide `AnalysisSuccessResponse` to `ResultsDisplay`:
   - See `src/mocks/sampleData.ts` for `SAMPLE_SUCCESS_RESPONSE`.
2) Selection and conflicts are managed by hooks in `src/hooks/`.
3) Enhanced Toolbar
   - Bulk: Select All, Clear, By Category, Compatible, Invert
   - Filters: Category, Fee range, Confidence
   - Export: CSV/JSON/HTML/PDF (stubbed; integrate with real backend as needed)
   - Undo/Redo: history-aware selection changes

### Defaults and Rules
- Fees: If an incoming recommendation has `schedule_fee === 0`, UI defaults it to `68.45`.
- Categories: Toolbar categories come from `recommendations[].mbsCategory`.

### Testing
- Unit/Component tests via Vitest + Testing Library:
  - `ResultsDisplay.stability.test.tsx`: render stability guard
  - `EnhancedToolbar.structure.test.tsx`: structural/aria expectations

### Recreate Locally (from scratch)
1) Clone the repo
2) Install Node 18+
3) `npm install`
4) `npm run dev` to serve
5) Visit the printed local URL from Vite

### Build and Preview
```
npm run build
npm run preview
```

### Integrations
- API service placeholders in `src/services/apiService.ts`
- Export/reporting services in `src/services/exportService.ts` and `src/services/reportingService.ts`

### Future Improvements
- Results View
  - Add a List view toggle and compact card density mode
  - Persist sort/filter state to URL params
  - Add skeleton loaders for perceived performance
- Toolbar UX
  - Save custom filter presets
  - Add a quick-search box for code text
  - Accessibility pass: roving tabindex for dropdowns
- Selection Intelligence
  - Deeper conflict graph analysis
  - Explainability panel for conflicts/suggestions
- Export
  - Real PDF generation server-side with templating
  - Export presets with saved columns/sections
- Theming
  - Light/Dark theme toggle with OS auto-detect

### Conventions
- TypeScript strict typing; avoid `any`
- Hooks: memoize expensive calcs; stable deps
- Effects: no state updates in effects without precise deps
- Styling: component-scoped CSS; avoid global resets

