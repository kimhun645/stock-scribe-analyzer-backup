# 🚀 Deploy Stock Scribe Analyzer with Firestore

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Firebase CLI** installed
3. **Node.js 20+** installed
4. **Firebase project** created

## Setup Steps

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting
```

### 2. Configure Environment Variables

Edit `env.production` file with your Firebase project details:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-firebase-app-id
```

### 3. Deploy

```bash
# Make script executable
chmod +x deploy-firestore.sh

# Deploy everything
./deploy-firestore.sh
```

## Manual Deployment Steps

### Backend to Cloud Run

```bash
# Build and deploy backend
gcloud run deploy stock-scribe-backend \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### Frontend to Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Firestore Rules and Indexes

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

## Firestore Collections Structure

- `users` - User accounts and authentication
- `products` - Product inventory
- `categories` - Product categories
- `suppliers` - Supplier information
- `movements` - Stock movements
- `budgetRequests` - Budget request forms
- `approvals` - Approval records
- `approvers` - Approver accounts
- `requesters` - Requester accounts
- `accountCodes` - Account codes

## Environment Variables for Cloud Run

Set these in Google Cloud Console or via CLI:

- `NODE_ENV=production`
- `PORT=8080`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `JWT_SECRET`
- `REFRESH_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CORS_ORIGIN`

## URLs After Deployment

- **Backend API**: `https://stock-scribe-backend-asia-southeast1-[PROJECT-ID].a.run.app`
- **Frontend**: `https://[PROJECT-ID].web.app`
- **Firestore Console**: `https://console.firebase.google.com/project/[PROJECT-ID]/firestore`

## Troubleshooting

1. **Firebase Authentication**: Make sure Firebase Auth is enabled
2. **Firestore Rules**: Check that rules allow your operations
3. **CORS Issues**: Verify CORS_ORIGIN includes your frontend URL
4. **Environment Variables**: Ensure all required env vars are set in Cloud Run
