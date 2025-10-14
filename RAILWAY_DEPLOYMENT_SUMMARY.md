# 🚀 Your Railway Deployment Configuration

## Backend URL (Already Deployed)
✅ **Backend API**: `https://coaxial-backend-production.up.railway.app`

---

## Frontend Deployment Steps

### Quick Deploy (5 Minutes)

1. **Commit and Push Your Code**
   ```bash
   git add .
   git commit -m "Configure Railway deployment with backend URL"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select: `coaxial-frontend`

3. **Add Environment Variable**
   In Railway Dashboard:
   - Click on your deployed service
   - Go to **"Variables"** tab
   - Click **"New Variable"**
   - Add:
     ```
     REACT_APP_API_BASE_URL
     ```
     Value:
     ```
     https://coaxial-backend-production.up.railway.app
     ```
   - Click **"Add"**

4. **Get Your Frontend URL**
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Your frontend will be live at: `https://[your-app-name].up.railway.app`

---

## Important: Configure Backend CORS

⚠️ **Critical Step**: Your backend needs to allow requests from your frontend domain.

After getting your frontend URL from Railway, update your Spring Boot backend CORS configuration:

```java
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:3000",  // Local development
                        "https://your-frontend-app.up.railway.app"  // Your Railway frontend URL
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Or using annotation:
```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://your-frontend-app.up.railway.app"
})
```

---

## Files Configured for Deployment

✅ **railway.json** - Railway deployment configuration  
✅ **env.example** - Environment variables template with your backend URL  
✅ **Dockerfile** - Optional Docker deployment  
✅ **.gitignore** - Updated for deployment files  
✅ **package.json** - Added `serve` package for production  
✅ **API Services** - Updated to use environment variables  

---

## Verification Checklist

After deployment, verify:

- [ ] Frontend is accessible at Railway URL
- [ ] Login page loads correctly
- [ ] API requests work (check browser console)
- [ ] No CORS errors
- [ ] All features functional

---

## URLs Summary

| Service | URL |
|---------|-----|
| **Backend API** | `https://coaxial-backend-production.up.railway.app` |
| **Frontend** | `https://[your-app-name].up.railway.app` (get from Railway) |

---

## Need Help?

📖 **Quick Start**: See `RAILWAY_QUICKSTART.md`  
📖 **Detailed Guide**: See `DEPLOYMENT.md`  
📖 **Files Overview**: See `DEPLOYMENT_FILES.md`  

💬 **Railway Support**: https://discord.gg/railway  
📚 **Railway Docs**: https://docs.railway.app  

---

## Next Steps After Deployment

1. ✅ Test all application features
2. ✅ Update backend CORS with frontend URL
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring and alerts
5. ✅ Share production URL with team

---

**Everything is ready for deployment! 🎉**

Just follow the steps above and your application will be live in minutes.

