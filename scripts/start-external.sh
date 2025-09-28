#!/bin/bash

echo "🚀 Starting ComplykOrt for External Access"
echo "=========================================="
echo "Server IP: 95.217.190.154"
echo "Frontend: http://95.217.190.154:3000"
echo "Backend:  http://95.217.190.154:3001"
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start the database first
echo "🗄️  Starting database..."
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run database setup if needed
if [ ! -f "backend/.prisma-migrated" ]; then
    echo "🗄️  Setting up database..."
    cd backend
    npm install
    npx prisma generate
    npx prisma db push
    touch .prisma-migrated
    cd ..
fi

# Start all services
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Show status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 ComplykOrt is now running!"
echo ""
echo "Access URLs:"
echo "  Frontend: http://95.217.190.154:3000"
echo "  Backend:  http://95.217.190.154:3001"
echo "  Health:   http://95.217.190.154:3001/health"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop:"
echo "  docker-compose -f docker-compose.prod.yml down"
