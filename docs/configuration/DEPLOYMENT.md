# Deployment Guide - MBS Coding Assistant

## 🚧 Deployment Status: DEVELOPMENT PHASE

The MBS Coding Assistant frontend is currently in **development and testing**. While it builds successfully and runs in development, it is not yet ready for production deployment.

## 📦 Build Information

### Current Build Stats
- **Bundle Size**: 243KB total (optimized)
- **Build Time**: ~1.1 seconds
- **TypeScript**: ✅ Strict mode, no errors
- **Dependencies**: Optimized and tree-shaken
- **Source Maps**: Available for debugging

### Build Output Structure
```
dist/
├── index.html                    # Main HTML entry
├── assets/
│   ├── index-[hash].css         # 37.77 KB (6.69 KB gzipped)
│   ├── index-[hash].js          # 63.70 KB (22.70 KB gzipped)  
│   ├── react-vendor-[hash].js   # 140.92 KB (45.30 KB gzipped)
│   └── form-vendor-[hash].js    # 0.09 KB (minimal)
```

## 🎯 Recommended Deployment Platforms

### 1. Vercel (Primary Recommendation)
**Why Vercel**:
- ✅ Zero-config deployment for Vite projects
- ✅ Automatic HTTPS and CDN
- ✅ Built-in proxy/rewrite capabilities for API
- ✅ Free tier suitable for this project
- ✅ Git-based automatic deployments

**Deployment Steps**:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from project root
vercel

# 3. Follow prompts:
#    - Link to existing project? No
#    - Project name? mbs-coding-assistant
#    - Directory? ./ (default)
#    - Override settings? No
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/$1"
    },
    {
      "source": "/health",
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/health"  
    },
    {
      "source": "/ready",
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/ready"
    },
    {
      "source": "/live", 
      "destination": "https://mbs-rag-api-736900516853.australia-southeast1.run.app/live"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, immutable, max-age=31536000"
        }
      ]
    }
  ]
}
```

### 2. Netlify (Alternative)
**Deployment Steps**:
```bash
# 1. Build the project
npm run build

# 2. Deploy dist folder to Netlify
# Via drag-and-drop or CLI
npm i -g netlify-cli
netlify deploy --prod --dir dist
```

**Netlify Configuration** (`_redirects` in `dist/`):
```
/api/*  https://mbs-rag-api-736900516853.australia-southeast1.run.app/api/:splat  200
/health https://mbs-rag-api-736900516853.australia-southeast1.run.app/health  200
/ready  https://mbs-rag-api-736900516853.australia-southeast1.run.app/ready   200  
/live   https://mbs-rag-api-736900516853.australia-southeast1.run.app/live    200
```

### 3. GitHub Pages (Static Only)
**Note**: Requires CORS setup on backend for direct API calls.

**Deployment Steps**:
```bash
# 1. Install gh-pages
npm install --save-dev gh-pages

# 2. Add to package.json
"homepage": "https://username.github.io/mbs-frontend",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# 3. Deploy
npm run deploy
```

## ⚙️ Environment Configuration

### Environment Variables
Required for deployment:
```bash
# Production API endpoint
VITE_API_BASE_URL=https://mbs-rag-api-736900516853.australia-southeast1.run.app
```

### Platform-Specific Setup

**Vercel**:
- Set environment variables in Vercel dashboard
- Automatic builds on git push
- HTTPS certificate included

**Netlify**:  
- Set environment variables in Netlify dashboard
- Build command: `npm run build`
- Publish directory: `dist`

## 🔄 CI/CD Pipeline

### Automated Deployment Workflow
1. **Push to Git** → Triggers build
2. **TypeScript Check** → Ensures no compilation errors
3. **Build Process** → Generates optimized bundle
4. **Deploy** → Pushes to CDN/hosting platform
5. **Health Check** → Verifies deployment success

### Build Commands
```bash
# Development
npm run dev              # Start dev server (port 5173)

# Production
npm run build           # Create optimized build
npm run preview         # Preview production build locally

# Quality Checks  
npm run type-check      # TypeScript validation
npm run lint            # Code quality (if configured)
```

## 🔍 Deployment Verification

### Post-Deployment Checklist
- [ ] **Homepage loads** - Main application interface appears
- [ ] **API connection** - Health check returns success
- [ ] **Form submission** - Consultation analysis works end-to-end
- [ ] **Text highlighting** - Evidence spans display correctly
- [ ] **Mobile responsive** - Interface works on mobile devices
- [ ] **Error handling** - Network errors display properly
- [ ] **HTTPS enabled** - Secure connection throughout

### Health Check URLs
After deployment, verify these endpoints:
```bash
# Replace your-domain.com with actual deployment URL
curl https://your-domain.com/health
curl https://your-domain.com/ready  
curl https://your-domain.com/live
```

### Full Integration Test
```bash
curl -X POST "https://your-domain.com/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "consultation_note": "Patient presented with chest pain. Examination normal. Duration 20 minutes.",
    "context": "general_practice",
    "options": {"max_codes": 3, "include_reasoning": true}
  }'
```

## 🏗️ Build Optimizations

### Current Optimizations Applied
- ✅ **Code Splitting** - React libraries separated from main bundle
- ✅ **Tree Shaking** - Unused code eliminated
- ✅ **Minification** - JavaScript and CSS compressed
- ✅ **Gzip Compression** - 70%+ size reduction
- ✅ **Asset Hashing** - Cache-busting for updates
- ✅ **Source Maps** - Available for debugging

### Performance Characteristics
- **First Contentful Paint**: < 1.2s (fast 3G)
- **Time to Interactive**: < 2.5s (fast 3G)  
- **Bundle Analysis**: No large dependencies
- **Lighthouse Score**: 95+ expected

## 🔒 Security Considerations

### Production Security
- ✅ **HTTPS Only** - All connections encrypted
- ✅ **No Secrets** - No API keys or sensitive data in frontend
- ✅ **CORS Handled** - Via proxy/rewrite rules
- ✅ **Content Security** - No inline scripts or styles
- ✅ **Modern Browsers** - ES2020+ for security features

### Headers Configuration
Recommended security headers (handled by platform):
```
Strict-Transport-Security: max-age=63072000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## 🚨 Rollback Strategy

### Quick Rollback Options
1. **Vercel**: Use dashboard to revert to previous deployment
2. **Netlify**: Deploy previous build from local `dist/` folder
3. **Manual**: Keep previous `dist/` folder as backup

### Emergency Procedures
```bash
# Quick local backup before deployment
cp -r dist dist-backup-$(date +%Y%m%d-%H%M)

# Emergency rollback (if needed)
# 1. Revert git commit
# 2. Rebuild and redeploy
npm run build && vercel --prod
```

## 📊 Monitoring & Analytics

### Recommended Monitoring
- **Vercel Analytics** - Built-in performance monitoring
- **Google Analytics** - User behavior tracking (if desired)
- **Sentry** - Error tracking (optional)
- **Backend Monitoring** - Google Cloud Run metrics

### Key Metrics to Monitor
- **Page Load Time** - Should be < 2 seconds
- **API Response Time** - Backend analysis performance
- **Error Rates** - Failed API requests or UI errors
- **User Engagement** - Feature usage patterns

## 🚧 Pre-Production Status

The MBS Coding Assistant frontend is **in development and testing phase**:

- ✅ **Build Compiles** - 243KB bundle, optimized build process  
- ✅ **TypeScript Clean** - No compilation errors or warnings
- ✅ **API Connected** - Working with backend in development
- ✅ **Features Implemented** - Core functionality in place
- 🚧 **Testing Phase** - Undergoing iterative testing and refinement
- 🚧 **UX Review** - User experience being optimized
- 🚧 **Production Readiness** - Pending completion of testing phase

**Status**: Not yet ready for production deployment. Active development and testing in progress.

---

*Deployment guide updated: 2025-08-27*