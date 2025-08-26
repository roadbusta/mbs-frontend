# MBS Frontend - Medicare Benefits Schedule Coding Assistant

A modern React frontend for the MBS Coding Assistant that helps hospital coding staff identify appropriate Medicare billing codes from consultation notes using AI-powered analysis.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

The app will connect to the production API by default. To use a local backend, update `vite.config.ts` proxy settings.

## 📋 Features

- **Smart Analysis**: Submit consultation notes and receive AI-powered MBS code recommendations
- **Confidence Scores**: See confidence percentages for each recommended code
- **Medical Reasoning**: Understand why each code was recommended with detailed explanations
- **Direct MBS Links**: Click through to official MBS Online pages for each code
- **Fast Performance**: Cached responses return in <100ms
- **Responsive Design**: Works on desktop and mobile devices
- **Offline Development**: Mock data available for development without backend

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS Modules
- **API**: RESTful API deployed on Google Cloud Run

## 📁 Project Structure

```
mbs-frontend/
├── src/
│   ├── components/        # React components (pending)
│   ├── services/          # API integration (pending)
│   ├── hooks/             # Custom React hooks (pending)
│   ├── types/             # TypeScript definitions ✅
│   ├── mocks/             # Sample data for testing ✅
│   ├── styles/            # Global styles (pending)
│   └── main.tsx           # App entry point (pending)
├── PRPs/                  # Project planning & tracking
│   ├── feature-files/     # Requirements & specifications
│   ├── planning/          # Implementation plans
│   ├── tracking/          # Progress, todos, blockers
│   └── learning/          # Decisions & retrospectives
├── API_DOCS.md           # Complete API documentation ✅
├── package.json          # Dependencies & scripts ✅
├── vite.config.ts        # Vite configuration ✅
├── tsconfig.json         # TypeScript config ✅
├── .env                   # Environment config ✅
└── .env.example          # Environment template ✅
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Production API endpoint
VITE_API_BASE_URL=https://mbs-rag-api-736900516853.australia-southeast1.run.app
```

### Local Development with Backend

If running the backend locally:

1. Start backend on port 8000
2. Frontend proxy will automatically forward `/api` requests
3. No CORS configuration needed

### Production Deployment

The app can be deployed to any static hosting service:

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy (example with Vercel)
vercel --prod
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

## 📊 API Integration

The frontend connects to a FastAPI backend that provides:

- **POST /api/v1/analyze**: Analyze consultation notes
- **GET /health**: Service health check
- **GET /ready**: Readiness check
- **GET /live**: Liveness check

### Request Example

```typescript
const response = await fetch('/api/v1/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consultation_note: "30-minute GP consultation...",
    options: {
      max_codes: 5,
      min_confidence: 0.6,
      include_reasoning: true
    }
  })
});
```

### Response Structure

```json
{
  "status": "success",
  "recommendations": [
    {
      "code": "23",
      "description": "Level B consultation",
      "confidence": 0.92,
      "reasoning": "The consultation duration and complexity...",
      "schedule_fee": 41.40,
      "category": "1"
    }
  ],
  "metadata": {
    "processing_time_ms": 8543,
    "model_used": "gpt-4o-mini",
    "categorization": {
      "context": "general_practice",
      "complexity": "standard"
    }
  }
}
```

## 🎨 User Interface

### Main Components

1. **Consultation Input**
   - Large text area for consultation notes
   - Character counter (10-10,000 chars)
   - Sample note loader for testing
   - Clear button to reset

2. **Results Display**
   - MBS code cards sorted by confidence
   - Visual confidence indicators
   - Copy code buttons
   - Direct links to MBS Online

3. **Loading States**
   - Progress spinner during API calls
   - Typical response: 6-30 seconds
   - Cancel button for long requests

4. **Error Handling**
   - Clear error messages
   - Retry functionality
   - Timeout after 35 seconds

## 📈 Performance

- **Bundle Size**: <500KB (target)
- **Time to Interactive**: <3 seconds
- **API Response**: 
  - Cached: <100ms
  - New analysis: 6-30 seconds
- **Lighthouse Score**: >90 (target)

## 🔍 Development Tips

### Using Mock Data

For offline development, the app includes comprehensive mock data:

```typescript
import { SAMPLE_CONSULTATION_NOTES, mockAnalyzeConsultation } from '@/mocks/sampleData';

// Use mock API during development
const result = await mockAnalyzeConsultation(
  SAMPLE_CONSULTATION_NOTES.standard_gp
);
```

### Type Safety

All API interactions are fully typed:

```typescript
import type { AnalysisRequest, AnalysisSuccessResponse } from '@/types/api.types';

// Type-safe API calls
const request: AnalysisRequest = {
  consultation_note: "...",
  options: { max_codes: 5 }
};
```

## 📚 Documentation

- [API Documentation](./API_DOCS.md) - Complete API reference
- [Frontend Plan](./PRPs/planning/low-level-plans/frontend-implementation-plan.md) - Implementation roadmap
- [Frontend Requirements](./PRPs/feature-files/frontend-requirements.md) - Detailed requirements
- [PRPs Overview](./PRPs/README.md) - Project planning and tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📝 License

Private repository - All rights reserved

## 🆘 Support

For issues or questions:
- Check the [API Documentation](./API_DOCS.md)
- Review the [Frontend Requirements](./PRPs/feature-files/frontend-requirements.md)
- Check [Current Progress](./PRPs/tracking/progress.md)
- Contact the development team

---

Built with ❤️ for Australian healthcare providers