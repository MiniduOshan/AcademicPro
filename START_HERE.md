# Quick Start Guide - Fix 404 Errors

## Issues Fixed:
1. ✅ API 404 errors - All endpoints now use `/api/` prefix correctly
2. ✅ Browser refresh 404 - Nginx configs updated with SPA fallback
3. ⚠️ Browser extension error - This is from a Chrome extension, not your app

## Start the Application (Local Development)

### Step 1: Start Backend
```powershell
# Open Terminal 1
cd backend
npm install   # Only needed first time
npm start
```

**Expected output:**
```
Server is running on port 5000
MongoDB connected successfully
```

### Step 2: Start Frontend
```powershell
# Open Terminal 2 (new terminal)
cd frontend
npm install   # Only needed first time
npm run dev
```

**Expected output:**
```
VITE v7.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 3: Test Connectivity
```powershell
# Open Terminal 3 (new terminal)
.\test-api.ps1
```

This will verify:
- Backend is running on port 5000
- API endpoints exist
- Frontend dev server is running

## Troubleshooting

### If you see 404 errors:

1. **Check Backend is Running**
   ```powershell
   # Open browser and go to:
   http://localhost:5000
   # Should see: "AcademicPro API is running..."
   ```

2. **Check Console Logs**
   - Open browser DevTools (F12)
   - Look at Console tab
   - Should see: `API Request: POST /api/users/login`

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Try logging in
   - Look for `/api/users/login` request
   - Check the URL - should be `http://localhost:5173/api/users/login`
   - Vite will proxy it to `http://localhost:5000/api/users/login`

4. **Check Backend Logs**
   - Look at Terminal 1 (backend)
   - Should see incoming requests logged
   - If you see "404 - Route not found", the path is wrong

### Common Issues:

**"Cannot connect to backend"**
- Backend not started - run `cd backend && npm start`
- Port 5000 in use - close other apps or change PORT in backend/.env

**"CORS error"**
- Should not happen with Vite proxy
- If it does, check vite.config.js proxy settings

**"Browser refresh shows 404"**
- In production/Docker: Fixed with nginx.conf
- In dev: Vite handles this automatically

**"Extension error message"**
- This is from a Chrome extension (not your app)
- Disable extensions or ignore this message

## Environment Setup

### Backend (.env)
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local) - Optional
```bash
# Only if you need to override
# VITE_API_URL=http://localhost:5000
```

## Production Deployment

After local testing works, push to GitHub:
```bash
git add .
git commit -m "Fix API endpoints and routing"
git push origin main
```

The GitHub Actions workflow will:
1. Deploy to Azure VM
2. Build containers with docker-compose
3. Nginx will proxy /api to backend container

## Verify Everything Works

### Local Dev Checklist:
- [ ] Backend shows "Server is running on port 5000"
- [ ] Frontend accessible at http://localhost:5173
- [ ] Login page loads without errors
- [ ] Can see API request logs in console
- [ ] Login attempt shows proper request in Network tab
- [ ] No 404 errors in console

### Production Checklist:
- [ ] `docker-compose ps` shows both containers running
- [ ] Can access site at http://your-vm-ip
- [ ] Login works without CORS errors
- [ ] Refresh any page doesn't show 404

## Need More Help?

Check the logs:
```powershell
# Backend logs
cd backend
npm start  # Watch the output

# Frontend logs
cd frontend
npm run dev  # Watch the output

# Docker logs (production)
docker-compose logs -f
```
