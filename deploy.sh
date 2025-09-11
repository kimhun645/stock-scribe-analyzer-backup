#!/bin/bash

# Stock Scribe Analyzer - Deployment Script
# Deploy to Google Cloud Run (Backend) and Firebase Hosting (Frontend)

set -e

echo "🚀 Starting deployment process..."

# Check if required tools are installed
check_tools() {
    echo "🔍 Checking required tools..."
    
    if ! command -v gcloud &> /dev/null; then
        echo "❌ gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    
    if ! command -v firebase &> /dev/null; then
        echo "❌ Firebase CLI not found. Please install Firebase CLI."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker."
        exit 1
    fi
    
    echo "✅ All required tools are installed."
}

# Set environment variables
set_env() {
    echo "🔧 Setting environment variables..."
    
    # Get project ID from gcloud
    PROJECT_ID=$(gcloud config get-value project)
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ No project ID found. Please run 'gcloud config set project YOUR_PROJECT_ID'"
        exit 1
    fi
    
    echo "📋 Project ID: $PROJECT_ID"
    
    # Set region
    REGION="asia-southeast1"
    echo "🌏 Region: $REGION"
}

# Build and deploy backend to Cloud Run
deploy_backend() {
    echo "🔨 Building and deploying backend to Cloud Run..."
    
    # Build Docker image
    echo "📦 Building Docker image..."
    docker build -t gcr.io/$PROJECT_ID/stock-scribe-backend:latest -f Dockerfile.production .
    
    # Push to Container Registry
    echo "⬆️ Pushing image to Container Registry..."
    docker push gcr.io/$PROJECT_ID/stock-scribe-backend:latest
    
    # Deploy to Cloud Run
    echo "🚀 Deploying to Cloud Run..."
    gcloud run deploy stock-scribe-backend \
        --image gcr.io/$PROJECT_ID/stock-scribe-backend:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 3001 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production,PORT=3001 \
        --set-secrets FIREBASE_PROJECT_ID=firebase-project-id:latest,GOOGLE_APPLICATION_CREDENTIALS=firebase-credentials:latest
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe stock-scribe-backend --region=$REGION --format='value(status.url)')
    echo "✅ Backend deployed successfully!"
    echo "🔗 Backend URL: $SERVICE_URL"
}

# Build and deploy frontend to Firebase Hosting
deploy_frontend() {
    echo "🎨 Building and deploying frontend to Firebase Hosting..."
    
    # Build frontend
    echo "📦 Building frontend..."
    npm run build
    
    # Deploy to Firebase Hosting
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    echo "✅ Frontend deployed successfully!"
}

# Deploy Firestore rules and indexes
deploy_firestore() {
    echo "🗄️ Deploying Firestore rules and indexes..."
    
    # Deploy Firestore rules
    echo "📋 Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    
    # Deploy Firestore indexes
    echo "📊 Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes
    
    echo "✅ Firestore configuration deployed successfully!"
}

# Main deployment function
main() {
    echo "🎯 Stock Scribe Analyzer - Deployment Script"
    echo "============================================="
    
    check_tools
    set_env
    
    # Ask for confirmation
    read -p "🤔 Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
    
    # Deploy components
    deploy_backend
    deploy_frontend
    deploy_firestore
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "====================================="
    echo "🔗 Backend URL: $SERVICE_URL"
    echo "🌐 Frontend URL: https://$PROJECT_ID.web.app"
    echo "📊 Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update CORS_ORIGIN in your environment variables"
    echo "2. Set up Firebase Authentication"
    echo "3. Configure Firestore security rules"
    echo "4. Test the application"
}

# Run main function
main "$@"
