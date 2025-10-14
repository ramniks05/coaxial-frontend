# Railway Deployment Guide

This guide will help you deploy the Learning Management System frontend to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account
2. Your backend API deployed and accessible (or use Railway for backend too)
3. Git repository pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### 1. Prepare Your Application

The application is already configured for Railway deployment with:
- ✅ Environment variable support for API URL
- ✅ Railway configuration file (`railway.json`)
- ✅ Production build optimization
- ✅ Static file serving with `serve`

### 2. Deploy to Railway

#### Option A: Deploy via Railway Dashboard (Recommended)

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repositories
   - Select this repository

3. **Configure Environment Variables**
   - After deployment starts, go to your project
   - Click on your service
   - Go to "Variables" tab
   - Add the following variable:
     ```
     Variable Name: REACT_APP_API_BASE_URL
     Variable Value: https://coaxial-backend-production.up.railway.app
     ```

4. **Deploy**
   - Railway will automatically:
     - Detect it's a React app
     - Install dependencies
     - Build the production bundle
     - Start the server
   - Wait for deployment to complete (usually 2-5 minutes)

5. **Access Your Application**
   - Once deployed, Railway will provide a URL
   - Click on "Settings" → "Networking" → "Generate Domain"
   - Your app will be available at: `https://your-app-name.up.railway.app`

#### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set REACT_APP_API_BASE_URL=https://coaxial-backend-production.up.railway.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Open Your App**
   ```bash
   railway open
   ```

### 3. Configure Custom Domain (Optional)

1. Go to your Railway project
2. Click on your service
3. Go to "Settings" → "Networking"
4. Click "Add Custom Domain"
5. Enter your domain (e.g., `app.yourdomain.com`)
6. Update your DNS records as instructed by Railway

## Environment Variables

The application requires the following environment variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `https://coaxial-backend-production.up.railway.app` |

### Adding Environment Variables in Railway

1. Go to your project dashboard
2. Click on your service
3. Navigate to "Variables" tab
4. Click "New Variable"
5. Add `REACT_APP_API_BASE_URL` with your backend URL
6. Click "Add" - Railway will automatically redeploy

## Build Configuration

The app uses the following configuration (defined in `railway.json`):

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s build -l $PORT",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Deployment Checklist

Before deploying, ensure:

- [ ] Backend API is deployed and accessible
- [ ] CORS is configured on backend to allow frontend domain
- [ ] Environment variables are set correctly
- [ ] Latest code is pushed to repository
- [ ] Build runs successfully locally (`npm run build`)

## Troubleshooting

### Build Fails

**Issue**: Build fails with "out of memory" error
- **Solution**: Railway provides sufficient memory, but if needed, contact support to increase limits

**Issue**: Dependencies installation fails
- **Solution**: Ensure `package.json` is valid and all dependencies are available

### Application Not Loading

**Issue**: White screen or errors in browser console
- **Solution**: Check if `REACT_APP_API_BASE_URL` is set correctly
- **Solution**: Inspect browser console for errors
- **Solution**: Check Railway logs for errors

### API Connection Issues

**Issue**: API requests failing with CORS errors
- **Solution**: Configure CORS on backend to allow Railway domain
  ```java
  // Example Spring Boot CORS configuration
  @CrossOrigin(origins = {
    "http://localhost:3000",
    "https://your-frontend-app.up.railway.app"  // Your Railway frontend URL
  })
  ```
- **Note**: Make sure your backend at `coaxial-backend-production.up.railway.app` has CORS configured to allow your frontend domain

**Issue**: API requests failing with network errors
- **Solution**: Verify `REACT_APP_API_BASE_URL` is correct
- **Solution**: Ensure backend is running and accessible
- **Solution**: Check backend logs for errors

### Deployment Not Updating

**Issue**: Changes not reflected after deployment
- **Solution**: Railway caches builds. Try:
  1. Click "Redeploy" in Railway dashboard
  2. Or push a new commit to trigger rebuild

## Monitoring

### View Logs

1. Go to Railway dashboard
2. Click on your service
3. Click "Deployments" tab
4. Click on latest deployment
5. View build and runtime logs

### Performance Monitoring

Railway provides:
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments
- **Logs**: Real-time application logs

Access these in your service dashboard.

## Scaling

Railway automatically scales based on:
- Traffic patterns
- Resource usage

For custom scaling:
1. Go to service settings
2. Adjust resource limits
3. Configure auto-scaling rules

## Cost Optimization

Railway pricing:
- **Free Tier**: $5 credit/month (sufficient for testing)
- **Pro Plan**: $20/month + usage-based pricing

Tips to reduce costs:
1. Use environment-based deployments (staging vs production)
2. Set up auto-sleep for inactive services
3. Monitor resource usage regularly

## Continuous Deployment

Railway automatically deploys when you push to your repository:

1. **Setup Auto-Deploy**
   - Already enabled by default
   - Every push to main branch triggers deployment

2. **Branch Deployments**
   - Deploy specific branches for staging
   - Create new service for each branch

3. **Pull Request Previews**
   - Railway can create preview deployments for PRs
   - Enable in project settings

## Backend Deployment (Bonus)

If you want to deploy your Java Spring Boot backend on Railway too:

1. Create new service in Railway project
2. Connect backend repository
3. Railway will auto-detect Java/Spring Boot
4. Add environment variables (database, etc.)
5. Update frontend `REACT_APP_API_BASE_URL` with backend URL

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Configure custom domain
3. ✅ Set up monitoring and alerts
4. ✅ Configure backup strategy
5. ✅ Document production URLs for team

---

Happy Deploying! 🚀

