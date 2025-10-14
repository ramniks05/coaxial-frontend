@echo off
echo ========================================
echo   Backend Switcher for Coaxial Academy
echo ========================================
echo.
echo Choose backend:
echo 1. Local Backend (http://localhost:8080)
echo 2. Railway Backend (https://coaxial-backend-production.up.railway.app)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo # Local Backend > .env.local
    echo REACT_APP_API_BASE_URL=http://localhost:8080 >> .env.local
    echo.
    echo ✅ Switched to LOCAL backend (localhost:8080)
    echo.
    echo ⚠️  RESTART your dev server: npm start
) else if "%choice%"=="2" (
    echo # Railway Backend > .env.local
    echo REACT_APP_API_BASE_URL=https://coaxial-backend-production.up.railway.app >> .env.local
    echo.
    echo ✅ Switched to RAILWAY backend
    echo.
    echo ⚠️  RESTART your dev server: npm start
) else (
    echo Invalid choice!
)
echo.
pause

