# Test API Connectivity

Write-Host "Testing Backend API..." -ForegroundColor Cyan

# Test 1: Backend root
Write-Host "`n1. Testing backend root..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
    Write-Host "✓ Backend root: $($response.StatusCode) - $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend root failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login endpoint
Write-Host "`n2. Testing /api/users/login endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        password = "test123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/users/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "✓ Login endpoint exists: $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Login endpoint exists (401 = auth failed, but route found)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✗ Login endpoint NOT FOUND (404)" -ForegroundColor Red
    } else {
        Write-Host "✓ Login endpoint exists: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    }
}

# Test 3: Check if backend is listening
Write-Host "`n3. Checking if port 5000 is open..." -ForegroundColor Yellow
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect("localhost", 5000)
    Write-Host "✓ Port 5000 is OPEN" -ForegroundColor Green
    $tcpClient.Close()
} catch {
    Write-Host "✗ Port 5000 is CLOSED - Backend not running!" -ForegroundColor Red
}

# Test 4: Frontend dev server
Write-Host "`n4. Testing frontend dev server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
    Write-Host "✓ Frontend dev server: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend dev server not running on port 5173" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nIf backend is not running, start it with:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host "`nIf frontend is not running, start it with:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
