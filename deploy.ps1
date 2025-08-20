# FlowMaster Deployment Script
# This script helps deploy the FlowMaster system

param(
    [string]$Environment = "Development",
    [switch]$SkipDatabase,
    [switch]$SkipFrontend,
    [switch]$UseDocker
)

Write-Host "🚀 FlowMaster Deployment Script" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Blue
    
    # Check .NET SDK
    try {
        $dotnetVersion = dotnet --version
        Write-Host "✅ .NET SDK: $dotnetVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ .NET SDK not found. Please install .NET 8.0 SDK" -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        exit 1
    }
    
    if ($UseDocker) {
        # Check Docker
        try {
            $dockerVersion = docker --version
            Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Docker not found. Please install Docker" -ForegroundColor Red
            exit 1
        }
        
        # Check Docker Compose
        try {
            $dockerComposeVersion = docker-compose --version
            Write-Host "✅ Docker Compose: $dockerComposeVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Docker Compose not found. Please install Docker Compose" -ForegroundColor Red
            exit 1
        }
    }
}

# Function to setup database
function Setup-Database {
    if ($SkipDatabase) {
        Write-Host "Skipping database setup..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "Setting up database..." -ForegroundColor Blue
    
    try {
        Set-Location "src"
        dotnet ef database update --project FlowMaster.Infrastructure --startup-project FlowMaster.API
        Write-Host "✅ Database setup completed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    finally {
        Set-Location ".."
    }
}

# Function to build and run backend
function Start-Backend {
    Write-Host "Building and starting backend..." -ForegroundColor Blue
    
    try {
        Set-Location "src"
        dotnet restore
        dotnet build
        
        if ($Environment -eq "Development") {
            Write-Host "Starting backend in development mode..." -ForegroundColor Yellow
            Start-Process -FilePath "dotnet" -ArgumentList "run", "--project", "FlowMaster.API" -NoNewWindow
        }
        else {
            Write-Host "Building backend for production..." -ForegroundColor Yellow
            dotnet publish FlowMaster.API -c Release -o ../publish/api
        }
        
        Write-Host "✅ Backend setup completed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Backend setup failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    finally {
        Set-Location ".."
    }
}

# Function to setup frontend
function Setup-Frontend {
    if ($SkipFrontend) {
        Write-Host "Skipping frontend setup..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "Setting up frontend..." -ForegroundColor Blue
    
    try {
        Set-Location "frontend"
        npm install
        
        if ($Environment -eq "Development") {
            Write-Host "Starting frontend in development mode..." -ForegroundColor Yellow
            Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow
        }
        else {
            Write-Host "Building frontend for production..." -ForegroundColor Yellow
            npm run build
        }
        
        Write-Host "✅ Frontend setup completed" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Frontend setup failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    finally {
        Set-Location ".."
    }
}

# Function to deploy with Docker
function Deploy-Docker {
    Write-Host "Deploying with Docker..." -ForegroundColor Blue
    
    try {
        docker-compose up -d
        Write-Host "✅ Docker deployment completed" -ForegroundColor Green
        Write-Host "Services available at:" -ForegroundColor Yellow
        Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  - API: http://localhost:7001" -ForegroundColor Cyan
        Write-Host "  - Swagger: http://localhost:7001" -ForegroundColor Cyan
        Write-Host "  - Hangfire: http://localhost:7001/hangfire" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Docker deployment failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Main execution
try {
    Test-Prerequisites
    
    if ($UseDocker) {
        Deploy-Docker
    }
    else {
        Setup-Database
        Start-Backend
        Setup-Frontend
        
        Write-Host "`n🎉 FlowMaster deployment completed!" -ForegroundColor Green
        Write-Host "Services available at:" -ForegroundColor Yellow
        Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  - API: http://localhost:7001" -ForegroundColor Cyan
        Write-Host "  - Swagger: http://localhost:7001" -ForegroundColor Cyan
        Write-Host "  - Hangfire: http://localhost:7001/hangfire" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
