# Railway Quick Start Guide 🚀

Deploy your Learning Management System frontend to Railway in 5 minutes!

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository: `coaxial-frontend`
4. Railway will automatically detect and deploy your React app

## Step 3: Configure Backend URL

1. In Railway dashboard, click on your deployed service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   ```
   Variable Name: REACT_APP_API_BASE_URL
   Variable Value: https://coaxial-backend-production.up.railway.app
   ```
5. Click **"Add"** - Railway will automatically redeploy with the new configuration

## Step 4: Get Your URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your app will be live at: `https://your-app-name.up.railway.app`

## That's it! 🎉

Your frontend is now live on Railway!

## What Was Configured?

✅ Environment variable support for API URL  
✅ Production build optimization  
✅ Static file serving  
✅ Auto-deployment on git push  
✅ HTTPS enabled by default  

## Need Help?

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

## Backend Deployment (Optional)

Want to deploy your Spring Boot backend on Railway too?

1. Create another service in Railway
2. Connect your backend repository
3. Railway auto-detects Java/Spring Boot
4. Add database and environment variables
5. Update `REACT_APP_API_BASE_URL` in frontend with the new backend URL

## Common Issues

**Q: API requests not working?**  
A: Ensure `REACT_APP_API_BASE_URL` is set to `https://coaxial-backend-production.up.railway.app` and backend has CORS configured for your frontend domain

**Q: White screen after deployment?**  
A: Check browser console and Railway logs for errors

**Q: Changes not reflecting?**  
A: Click "Redeploy" in Railway or push a new commit

## Cost

- **Free Tier**: $5 credit/month (great for testing)
- **Pro Plan**: $20/month + usage ($5 credit included)

Your frontend app typically uses ~$1-2/month on the free tier.

---

Happy deploying! 🚂

