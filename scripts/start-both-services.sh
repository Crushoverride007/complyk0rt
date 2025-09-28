#!/bin/bash

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python3 -m http.server" 2>/dev/null || true
pkill -f "tsx.*server-simple" 2>/dev/null || true
sleep 2

echo "🚀 Starting ComplykOrt services..."

# Start frontend
echo "📱 Starting frontend on port 3000..."
(cd simple-frontend && python3 -m http.server 3000 --bind 0.0.0.0 >/dev/null 2>&1) &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Start backend
echo "🔧 Starting backend on port 3001..."
(cd backend && npm run dev:simple >/dev/null 2>&1) &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 3

# Test both services
echo ""
echo "🧪 Testing services..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "error")
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "error")

echo "Frontend status: $FRONTEND_STATUS"
echo "Backend status: $BACKEND_STATUS"

if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo ""
    echo "✅ Both services are running successfully!"
    echo "📍 Frontend: http://95.217.190.154:3000"
    echo "📍 Backend API: http://95.217.190.154:3001"
    echo ""
    echo "Process IDs:"
    echo "Frontend: $FRONTEND_PID"
    echo "Backend: $BACKEND_PID"
    echo ""
    echo "To stop services:"
    echo "kill $FRONTEND_PID $BACKEND_PID"
else
    echo ""
    echo "❌ One or more services failed to start"
fi

