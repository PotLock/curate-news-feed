# Vercel Deployment Configuration

This document tracks all changes made for Vercel deployment. Use this to revert if needed.

## Files Created

### 1. `vercel.json` (Root directory)
```json
{
  "version": 2,
  "buildCommand": "bun run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "bun install",
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/trpc/(.*)",
      "destination": "/api"
    }
  ]
}
```

### 2. `api/index.ts` (Root directory)
```typescript
import { handle } from 'hono/vercel'
import app from "../apps/server/src/index";

export default handle(app);
```

## Files Modified

### 1. `apps/web/src/utils/trpc.ts`
**Changed lines 26-28:**

**Before:**
```typescript
url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
```

**After:**
```typescript
url: import.meta.env.VITE_SERVER_URL 
  ? `${import.meta.env.VITE_SERVER_URL}/trpc`
  : "/trpc", // Use relative URL in production
```

### 2. `apps/web/src/lib/auth-client.ts`
**Changed line 5:**

**Before:**
```typescript
baseURL: import.meta.env.VITE_SERVER_URL,
```

**After:**
```typescript
baseURL: import.meta.env.VITE_SERVER_URL || "", // Use relative URL in production
```

## Deployment Settings for Vercel

- **Root Directory**: Leave empty (use repository root)
- **Framework Preset**: Other/None
- **Build Command**: Auto-detected from vercel.json (`bun run build`)
- **Output Directory**: Auto-detected from vercel.json (`apps/web/dist`)

## How It Works

1. **Frontend**: React app builds to static files served by Vercel CDN
2. **Backend**: Hono server runs as Vercel serverless functions via `api/index.ts`
3. **API Routing**: `/api/*` and `/trpc/*` requests are routed to the Hono serverless function
4. **Environment**: In production, web app uses relative URLs to call the API on the same domain

## Revert Instructions

To revert these changes:

1. **Delete created files:**
   ```bash
   rm vercel.json
   rm -rf api/
   ```

2. **Revert trpc.ts:**
   ```typescript
   // Change back to:
   url: `${import.meta.env.VITE_SERVER_URL}/trpc`,
   ```

3. **Revert auth-client.ts:**
   ```typescript
   // Change back to:
   baseURL: import.meta.env.VITE_SERVER_URL,
   ```

## Original Development Setup

The original setup remains unchanged:
- `bun dev` - runs both web and server locally
- Web app runs on port 3001
- Server runs on port 3000
- Local development uses `VITE_SERVER_URL=http://localhost:3000`