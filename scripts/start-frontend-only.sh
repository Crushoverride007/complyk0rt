#!/bin/bash

echo "🚀 Starting ComplykOrt Frontend for External Access"
echo "================================================="
echo "Server IP: 95.217.190.154"
echo ""

# Stop any existing processes
pkill -f "npm run dev" 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p logs

cd frontend

# Install dependencies if not already installed  
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend server on 0.0.0.0:3000..."

# Start frontend - accessible from external IPs
HOSTNAME=0.0.0.0 PORT=3000 npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

echo ""
echo "🎉 ComplykOrt Frontend is starting up!"
echo ""
echo "Access URL:"
echo "  Frontend: http://95.217.190.154:3000"
echo ""
echo "Process ID: $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  Frontend: tail -f logs/frontend.log"
echo ""
echo "To stop the service:"
echo "  kill \$(cat frontend.pid)"
echo ""

# Wait and show status
sleep 3
echo "📊 Checking if frontend is running..."
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend is running (PID: $FRONTEND_PID)"
    echo "🌐 Try accessing: http://95.217.190.154:3000"
else
    echo "❌ Frontend failed to start"
fi
