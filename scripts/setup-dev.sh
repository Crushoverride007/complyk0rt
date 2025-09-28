#!/bin/bash

echo "🚀 Setting up ComplykOrt Development Environment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database/init
mkdir -p backend/logs
mkdir -p frontend/.next

# Set up environment files
echo "🔧 Setting up environment files..."

# Backend environment
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "ℹ️  backend/.env already exists"
fi

# Frontend environment
cat > frontend/.env.local << 'FRONTEND_ENV'
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ComplykOrt
NEXT_PUBLIC_VERSION=1.0.0
FRONTEND_ENV

echo "✅ Created frontend/.env.local"

# Start the development environment
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout 60 bash -c 'until docker-compose exec postgres pg_isready -U complykort -d complykort_dev; do sleep 1; done'

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
cd ..

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "To start the development servers:"
echo "  Frontend: cd frontend && npm run dev"
echo "  Backend:  cd backend && npm run dev"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Database: localhost:5432"
echo "  Redis:    localhost:6379"
echo ""
echo "Database credentials:"
echo "  Host:     localhost"
echo "  Port:     5432"
echo "  Database: complykort_dev"
echo "  User:     complykort"
echo "  Password: complykort_password"
