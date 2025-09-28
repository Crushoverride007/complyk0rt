#!/bin/bash

echo "🚀 Starting ComplykOrt Manually for External Access"
echo "================================================="
echo "Server IP: 95.217.190.154"
echo ""

# Start PostgreSQL with Docker (simpler than installing locally)
echo "🗄️  Starting PostgreSQL..."
docker run -d \
  --name complykort-postgres \
  --restart unless-stopped \
  -e POSTGRES_DB=complykort_dev \
  -e POSTGRES_USER=complykort \
  -e POSTGRES_PASSWORD=complykort_password \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for database
echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

# Install backend dependencies and start
echo "🔧 Setting up backend..."
cd backend

# Update environment for external access
cat > .env << 'BACKEND_ENV'
DATABASE_URL="postgresql://complykort:complykort_password@localhost:5432/complykort_dev?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-dev-external"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters-dev-external"
NODE_ENV="development"
PORT=3001
API_BASE_URL="http://95.217.190.154:3001"
FRONTEND_URL="http://95.217.190.154:3000"
ALLOWED_ORIGINS="http://95.217.190.154:3000,http://localhost:3000"
BACKEND_ENV

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Setup database
echo "🗄️  Setting up database schema..."
npx prisma generate
npx prisma db push

echo "🚀 Starting backend server..."
# Start backend in background
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

cd ../frontend

# Install frontend dependencies if not already installed  
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend server..."
# Start frontend in background
HOSTNAME=0.0.0.0 npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

# Create logs directory
mkdir -p logs

echo ""
echo "🎉 ComplykOrt is starting up!"
echo ""
echo "Access URLs:"
echo "  Frontend: http://95.217.190.154:3000"
echo "  Backend:  http://95.217.190.154:3001"
echo "  Health:   http://95.217.190.154:3001/health"
echo ""
echo "Process IDs:"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f logs/backend.log"
echo "  Frontend: tail -f logs/frontend.log"
echo ""
echo "To stop the services:"
echo "  kill \$(cat backend.pid frontend.pid)"
echo "  docker stop complykort-postgres && docker rm complykort-postgres"
echo ""

# Wait a moment then test
sleep 5
echo "🧪 Testing backend health..."
curl -s http://95.217.190.154:3001/health | jq . 2>/dev/null || curl -s http://95.217.190.154:3001/health
