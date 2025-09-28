#!/bin/bash

echo "🚀 Starting ComplykOrt Services..."

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pkill -f "simple-fresh-backend" 2>/dev/null || true
pkill -f "tsx.*server-real" 2>/dev/null || true

# Clear frontend cache
echo "🧹 Clearing frontend cache..."
rm -rf /root/complykort/frontend/.next

# Start services with PM2
echo "▶️ Starting services with PM2..."
pm2 start /root/complykort/ecosystem.config.js

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test services
echo "🧪 Testing services..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running on port 3001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo "🎉 All services are running successfully!"
echo "🌐 Frontend: http://95.217.190.154:3000"
echo "🔧 Backend: http://95.217.190.154:3001"
echo ""
echo "📊 PM2 Status:"
pm2 list
