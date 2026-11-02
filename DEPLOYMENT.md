# Deployment Guide

## Prerequisites

- MongoDB Atlas account (free tier available)
- Google Gemini API key
- GitHub account (for CI/CD)

## Environment Variables

### Backend (.env)
```bash
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mystery-room
GEMINI_API_KEY=AIzaSy...
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

## Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `ai-mystery-room-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Env Vars**: Add from `.env` file
6. Click "Create Web Service"

## Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/)
3. Click "Add New..." → "Project"
4. Select your repository
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render backend URL + `/api`
7. Click "Deploy"

## Deploy Frontend to Netlify

1. Push code to GitHub
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables in Site Settings → Build & deploy → Environment
7. Click "Deploy site"

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/mystery-room
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3000/api
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for production)
5. Get connection string and update `MONGODB_URI`

## GitHub Actions CI/CD

### Backend workflow (.github/workflows/backend-ci.yml)
```yaml
name: Backend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test
```

### Frontend workflow (.github/workflows/frontend-ci.yml)
```yaml
name: Frontend CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
      - run: cd frontend && npm run build
```

## Verification Steps

After deployment:
1. Visit frontend URL
2. Create a test case
3. Verify investigation page loads
4. Test clue discovery
5. Make an accusation
6. Check results page displays correctly
7. Verify MongoDB has the case data

## Troubleshooting

### CORS Issues
Ensure `CLIENT_URL` in backend matches your deployed frontend URL exactly.

### Database Connection
Verify MongoDB Atlas IP whitelist includes your deployment service IPs.

### API Key Issues
Ensure `GEMINI_API_KEY` is properly set in your deployment environment.

### Build Failures
Check Node.js version compatibility (requires 18+).
