# Azure VM Docker Deployment Verification

## ✅ All Docker Files Are Production-Ready

Your configuration is correct for Azure VM deployment:

### Docker Setup Verified:
- ✅ **docker-compose.yml** - Both containers on shared network
- ✅ **frontend/Dockerfile** - Includes nginx.conf with API proxy
- ✅ **frontend/nginx.conf** - Proxies `/api/` to `backend:5000` container
- ✅ **backend/Dockerfile** - Runs Node.js server
- ✅ **GitHub Actions workflow** - Uses docker-compose

## Deploy to Azure VM

### Option 1: Push to GitHub (Automatic)
```bash
git add .
git commit -m "Fix API routing and Docker configuration"
git push origin main
```

GitHub Actions will automatically:
1. SSH to your VM
2. Clone/pull latest code
3. Create backend .env
4. Run `docker-compose up -d --build`

### Option 2: Manual Deployment on VM

SSH to your Azure VM:
```bash
ssh user@4.240.89.33
```

Then run:
```bash
cd ~/project

# Pull latest code
git pull origin main

# Create/update backend .env
cat <<EOF > backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://4.240.89.33
EOF

# Stop old containers
docker-compose down

# Build and start new containers
docker-compose up -d --build

# Wait 10 seconds for startup
sleep 10

# Check status
docker-compose ps
```

## Verify Deployment

### 1. Check Containers Are Running
```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS    PORTS
academicpro-backend     Up        0.0.0.0:5000->5000/tcp
academicpro-frontend    Up        0.0.0.0:80->80/tcp
```

### 2. Check Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend (Nginx) logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### 3. Test Backend Directly
```bash
# From inside VM
curl http://localhost:5000
# Should return: "AcademicPro API is running..."

curl http://localhost:5000/api/users/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
# Should return JSON error (not 404)
```

### 4. Test Frontend Access
```bash
# From inside VM
curl -I http://localhost:80
# Should return: HTTP/1.1 200 OK
```

### 5. Test from Browser
Open: `http://4.240.89.33`

- ✅ Should see login page
- ✅ Can login/signup
- ✅ Can refresh any page (no 404)
- ✅ Dashboard works

### 6. Test API Proxy
Open browser DevTools (F12) → Network tab, then try logging in:
- Request URL should be: `http://4.240.89.33/api/users/login`
- Status should be: 200 or 401 (not 404)

## Troubleshooting

### Container won't start
```bash
# Check detailed logs
docker-compose logs backend
docker-compose logs frontend

# Check if ports are in use
sudo lsof -i :80
sudo lsof -i :5000
```

### 404 on API calls
```bash
# Test from inside frontend container
docker exec academicpro-frontend wget -O- http://backend:5000
# Should return: "AcademicPro API is running..."

# Check Nginx config in container
docker exec academicpro-frontend cat /etc/nginx/conf.d/default.conf
```

### Can't connect to MongoDB
```bash
# Check backend logs
docker-compose logs backend | grep -i mongo

# Verify MONGO_URI in .env
cat backend/.env | grep MONGO_URI
```

### CORS errors
```bash
# Check backend .env
cat backend/.env | grep CORS_ORIGIN
# Should be: CORS_ORIGIN=http://4.240.89.33
```

### Browser refresh shows 404
- This should NOT happen - nginx.conf has `try_files $uri $uri/ /index.html;`
- Check: `docker exec academicpro-frontend cat /etc/nginx/conf.d/default.conf`
- Look for `try_files $uri $uri/ /index.html;` in location /

## Quick Debug Commands

```bash
# Restart everything
docker-compose restart

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d

# View container IPs
docker network inspect academicpro_academicpro-network

# Execute commands in containers
docker exec -it academicpro-backend sh
docker exec -it academicpro-frontend sh
```

## Production Checklist

Before going live, verify:
- [ ] Backend .env has real MONGO_URI and JWT_SECRET
- [ ] CORS_ORIGIN matches your domain/IP
- [ ] Both containers show "Up" status
- [ ] No errors in logs
- [ ] Can access site from browser
- [ ] Login/signup works
- [ ] API calls return 200/401 (not 404)
- [ ] Page refresh doesn't 404
- [ ] MongoDB is accessible from VM

## Network Flow in Docker

```
Browser → http://4.240.89.33/api/users/login
    ↓
Nginx (frontend container) sees /api/
    ↓
proxy_pass http://backend:5000
    ↓
Backend container at backend:5000/api/users/login
    ↓
Express routes /api/users → userRoutes
    ↓
MongoDB → Returns user data
```

Your configuration is correct - just deploy and verify!
