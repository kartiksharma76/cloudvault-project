# Deployment Guide

The workspace has been configured to allow deploying the frontend (`cloudvault`) and the backend (`api-server`) separately. Both applications still work seamlessly together during development, and you can now easily deploy them to your favorite hosting platforms.

## New NPM Scripts

You can run the frontend and backend using the newly added scripts from the root directory:

- `npm run dev:frontend` - Starts the frontend development server
- `npm run dev:backend` - Starts the backend development server
- `npm run build:frontend` - Builds the frontend for production
- `npm run build:backend` - Builds the backend for production
- `npm run start:frontend` - Serves the built frontend
- `npm run start:backend` - Starts the backend server in production

---

## 1. Deploying the Backend (e.g., to Render / Railway / Heroku)

Since the backend is an Express Node.js application, you should deploy it to a Node.js web service provider.

### Setup Instructions (e.g., Render)
1. **Build Command**: `pnpm run build:backend`
2. **Start Command**: `pnpm run start:backend`
3. **Environment Variables**:
   You need to provide the same environment variables that you use in `.env` for the backend to work:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - etc...

*Note: Once your backend is deployed, note down its public URL (e.g., `https://cloudvault-api.onrender.com`). You will need it for the frontend.*

---

## 2. Deploying the Frontend (e.g., to Vercel / Netlify)

The frontend is a Vite React application. Vercel is highly recommended for this.

### Setup Instructions (Vercel)
1. **Framework Preset**: Vite
2. **Build Command**: `pnpm run build:frontend`
3. **Output Directory**: `artifacts/cloudvault/dist/public`
4. **Environment Variables**: N/A (unless you have custom VITE_ variables)

### Connecting Frontend to Backend in Production
By default, the frontend makes requests to `/api/...`. During development, Vite proxies this to your local backend. In production, you need to tell Vercel to proxy these requests to your deployed backend.

Create a `vercel.json` file in the root of your repository with the following content:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://<YOUR_DEPLOYED_BACKEND_URL>/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*Replace `<YOUR_DEPLOYED_BACKEND_URL>` with your actual backend URL (e.g., `https://cloudvault-api.onrender.com`).*

This rewrite rule ensures that all `/api/...` requests from the frontend are routed directly to your separate backend server, exactly as it was working before!
