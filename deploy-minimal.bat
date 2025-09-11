@echo off
echo Deploying backend to Cloud Run...
gcloud run deploy stock-scribe-backend --source . --region asia-southeast1 --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --min-instances 0 --max-instances 5 --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=stock-6e930 --quiet
echo Deployment complete!
pause
