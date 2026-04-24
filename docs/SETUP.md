# docs/SETUP.md

## HeavyHub Deployment Guide

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Vercel CLI (optional, for frontend hosting)
- Google Cloud account (for Maps API key)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → name it "HeavyHub"
3. Disable Google Analytics (optional)
4. Click "Create project"

### Step 2: Enable Firebase Services
- **Authentication**: Enable Google sign-in method
- **Firestore Database**: Start in production mode (location closest to users)
- **Storage**: Start in production mode
- **Functions**: Upgrade to Blaze plan (required for external APIs)

### Step 3: Register Web App
- Click the `</>` icon → register app name "HeavyHub Web"
- Copy the firebaseConfig object (save for .env)

### Step 4: Environment Variables (frontend)
Create `.env` in `frontend/` folder:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=heavyhub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=heavyhub
VITE_FIREBASE_STORAGE_BUCKET=heavyhub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key