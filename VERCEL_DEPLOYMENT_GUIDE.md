# 🚀 Vercel Production Deployment Guide

## Overview
This guide will help you deploy the Tactical Intel Dashboard to Vercel production environment with all necessary configurations.

## Prerequisites

### 1. Install Vercel CLI
```bash
npm install -g vercel@latest
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Environment Variables Setup
Before deployment, you'll need to set up environment variables in your Vercel dashboard:

**Required Variables:**
- `VITE_INFURA_PROJECT_ID` - Your Infura project ID
- `VITE_INFURA_API_SECRET` - Your Infura API secret
- `VITE_IPFS_GATEWAY_URL` - IPFS gateway URL (default: https://ipfs.io/ipfs/)

**Setting Environment Variables:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production, Preview, and Development environments

## Deployment Methods

### Method 1: Quick Deploy (Recommended)
```bash
# Run the automated deployment script
./deploy-vercel.sh --prod
```

### Method 2: Manual Deployment
```bash
# 1. Clean and build
rm -rf dist/ .vercel/
npm install
npm run build

# 2. Deploy to production
vercel --prod
```

### Method 3: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Push changes to your main branch
3. Vercel will automatically deploy

## Configuration Files

### vercel.json
The project includes a complete Vercel configuration that:
- Builds the Vite application
- Configures the CORS proxy Edge Function
- Sets up proper routing for SPA
- Enables CORS headers

### Key Features:
- **Edge Function**: `/api/proxy-feed.ts` for RSS feed proxying
- **SPA Routing**: All routes redirect to `index.html`
- **CORS Support**: Headers configured for cross-origin requests
- **Build Optimization**: Custom chunk splitting for better performance

## Verification Steps

### 1. Test the Deployment
After deployment, verify the following:

```bash
# Test the main application
curl https://your-app.vercel.app

# Test the proxy endpoint
curl "https://your-app.vercel.app/api/proxy-feed?url=https://feeds.bbci.co.uk/news/rss.xml"
```

### 2. Check Core Functionality
- ✅ Application loads without errors
- ✅ RSS feeds can be added and loaded
- ✅ Proxy endpoint responds correctly
- ✅ CORS headers are present
- ✅ All static assets load properly

### 3. Monitor Performance
- Check Vercel Analytics for loading times
- Monitor function execution logs
- Verify edge function performance

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check for TypeScript errors
npm run build
# Fix any compilation errors before deployment
```

#### 2. Environment Variables Not Set
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for "Production" environment

#### 3. CORS Issues
The Edge Function should handle CORS automatically. If issues persist:
- Check Vercel function logs
- Verify the proxy endpoint is responding
- Test with curl to isolate client-side issues

#### 4. Large Bundle Size
The build includes optimizations to reduce bundle size:
- Vendor chunks are separated
- Code splitting is enabled
- Static assets are optimized

### Debugging Commands

```bash
# Check Vercel project status
vercel list

# View deployment logs
vercel logs [deployment-url]

# Inspect project configuration
vercel inspect [deployment-url]
```

## Production Optimization

### Performance Features Enabled:
- **Edge Functions**: Sub-200ms global response times
- **CDN Distribution**: Assets served from global edge network
- **Compression**: Gzip compression enabled
- **Caching**: Static assets cached with optimal headers
- **Code Splitting**: Reduced initial bundle size

### Security Features:
- **HTTPS Only**: All traffic encrypted
- **CORS Protection**: Controlled cross-origin access
- **Input Validation**: URL validation in proxy function
- **Rate Limiting**: Built-in Vercel rate limiting

## Maintenance

### Regular Tasks:
1. **Monitor Function Usage**: Check Vercel dashboard for function invocations
2. **Update Dependencies**: Keep packages up to date
3. **Performance Monitoring**: Watch for degradation in load times
4. **Security Updates**: Apply security patches promptly

### Updating the Deployment:
```bash
# For code changes
git push origin main  # If using GitHub integration
# OR
./deploy-vercel.sh --prod  # Manual deployment

# For environment variable changes
# Update via Vercel dashboard → Settings → Environment Variables
```

## Support

### Resources:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Edge Functions Documentation](https://vercel.com/docs/concepts/functions/edge-functions)

### Getting Help:
- Check Vercel function logs for errors
- Review the deployment console output
- Test locally with `npm run build && npm run preview`

---

**Deployment Checklist:**
- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] Proxy endpoint tested
- [ ] All routes working
- [ ] Performance acceptable
- [ ] No console errors

**Ready for Production! 🎉**
