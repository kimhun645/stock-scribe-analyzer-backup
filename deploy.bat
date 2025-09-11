@echo off
REM Stock Scribe Analyzer - Windows Deployment Script
REM Deploy to Google Cloud Run (Backend) and Firebase Hosting (Frontend)

setlocal enabledelayedexpansion

echo 🚀 Starting deployment process...

REM Check if required tools are installed
:check_tools
echo 🔍 Checking required tools...

where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI not found. Please install Google Cloud SDK.
    exit /b 1
)

where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Please install Firebase CLI.
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker.
    exit /b 1
)

echo ✅ All required tools are installed.

REM Set environment variables
:set_env
echo 🔧 Setting environment variables...

REM Get project ID from gcloud
for /f "tokens=*" %%i in ('gcloud config get-value project') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ❌ No project ID found. Please run 'gcloud config set project YOUR_PROJECT_ID'
    exit /b 1
)

echo 📋 Project ID: %PROJECT_ID%

REM Set region
set REGION=asia-southeast1
echo 🌏 Region: %REGION%

REM Build and deploy backend to Cloud Run
:deploy_backend
echo 🔨 Building and deploying backend to Cloud Run...

REM Build Docker image
echo 📦 Building Docker image...
docker build -t gcr.io/%PROJECT_ID%/stock-scribe-backend:latest -f Dockerfile.production .

REM Push to Container Registry
echo ⬆️ Pushing image to Container Registry...
docker push gcr.io/%PROJECT_ID%/stock-scribe-backend:latest

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy stock-scribe-backend ^
    --image gcr.io/%PROJECT_ID%/stock-scribe-backend:latest ^
    --region %REGION% ^
    --platform managed ^
    --allow-unauthenticated ^
    --port 3001 ^
    --memory 1Gi ^
    --cpu 1 ^
    --min-instances 0 ^
    --max-instances 10 ^
    --set-env-vars NODE_ENV=production,PORT=3001

REM Get service URL
for /f "tokens=*" %%i in ('gcloud run services describe stock-scribe-backend --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i
echo ✅ Backend deployed successfully!
echo 🔗 Backend URL: %SERVICE_URL%

REM Build and deploy frontend to Firebase Hosting
:deploy_frontend
echo 🎨 Building and deploying frontend to Firebase Hosting...

REM Build frontend
echo 📦 Building frontend...
npm run build

REM Deploy to Firebase Hosting
echo 🚀 Deploying to Firebase Hosting...
firebase deploy --only hosting

echo ✅ Frontend deployed successfully!

REM Deploy Firestore rules and indexes
:deploy_firestore
echo 🗄️ Deploying Firestore rules and indexes...

REM Deploy Firestore rules
echo 📋 Deploying Firestore rules...
firebase deploy --only firestore:rules

REM Deploy Firestore indexes
echo 📊 Deploying Firestore indexes...
firebase deploy --only firestore:indexes

echo ✅ Firestore configuration deployed successfully!

REM Main deployment function
:main
echo 🎯 Stock Scribe Analyzer - Deployment Script
echo =============================================

call :check_tools
call :set_env

REM Ask for confirmation
set /p CONFIRM="🤔 Do you want to proceed with deployment? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Deployment cancelled.
    exit /b 1
)

REM Deploy components
call :deploy_backend
call :deploy_frontend
call :deploy_firestore

echo.
echo 🎉 Deployment completed successfully!
echo =====================================
echo 🔗 Backend URL: %SERVICE_URL%
echo 🌐 Frontend URL: https://%PROJECT_ID%.web.app
echo 📊 Firestore: https://console.firebase.google.com/project/%PROJECT_ID%/firestore
echo.
echo 📝 Next steps:
echo 1. Update CORS_ORIGIN in your environment variables
echo 2. Set up Firebase Authentication
echo 3. Configure Firestore security rules
echo 4. Test the application

REM Run main function
call :main

pause
