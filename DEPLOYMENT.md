# 🚀 MBS Frontend Deployment Guide

## Vercel Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- This repository pushed to GitHub

### 2. Automatic Deployment (Recommended)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Vite project

2. **Environment Variables:**
   Set these in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://mbs-rag-api-736900516853.australia-southeast1.run.app
   VITE_APP_NAME=MBS RAG Assistant
   VITE_APP_VERSION=1.0.0
   ```

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### 3. Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

### 4. Configuration Files

- `vercel.json` - Vercel configuration with API proxying
- `.env.example` - Environment variables template
- `vite.config.ts` - Build configuration with API proxy

### 5. Deployment Features

✅ **Automatic Build Process**
- Vite build system
- TypeScript compilation
- CSS optimization and minification
- Code splitting for optimal loading

✅ **API Proxy Configuration**
- Seamless API routing to backend
- CORS handling
- Health check endpoints

✅ **Performance Optimizations**
- React/vendor code splitting
- Gzip compression
- Source maps for debugging

✅ **Environment Configuration**
- Production API endpoints
- Environment-specific settings

### 6. Post-Deployment Testing

After deployment, test these endpoints:
- Main app: `https://your-app.vercel.app`
- Health check: `https://your-app.vercel.app/health`
- API proxy: `https://your-app.vercel.app/api/v1/analyze`

### 7. Custom Domain (Optional)

1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Update DNS records as instructed

### 8. Monitoring

- **Build Logs:** Available in Vercel dashboard
- **Runtime Logs:** Function logs for debugging
- **Performance:** Core Web Vitals monitoring
- **Analytics:** Built-in Vercel Analytics

### 9. Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript configuration

**API Issues:**
- Check API proxy configuration in vercel.json
- Verify backend API is accessible
- Check CORS settings

**Environment Variables:**
- Ensure all VITE_ prefixed variables are set
- Redeploy after changing environment variables

## 📦 Production Build Info

- **Framework:** Vite + React + TypeScript
- **Bundle Size:** ~282KB (gzipped ~82KB)
- **Build Time:** ~800ms
- **Features:** All Phase 4 functionality included
  - Export to CSV/JSON/HTML/PDF
  - Advanced selection management
  - Professional reporting
  - Enhanced UX with keyboard shortcuts

## 🔧 Development vs Production

**Development:**
```bash
npm run dev      # Local development server
npm run test     # Run test suite
npm run preview  # Preview production build locally
```

**Production:**
```bash
npm run build    # Production build
npm run preview  # Preview production build
```

The application is now ready for production deployment with all Phase 4 features fully functional!