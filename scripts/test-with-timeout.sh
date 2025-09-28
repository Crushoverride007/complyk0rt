#!/bin/bash

echo "🚀 STARTING FRONTEND SERVER WITH TIMEOUT HANDLING"
echo "================================================="

# Function to start frontend and test with timeout
test_frontend() {
    local timeout=30
    echo "📱 Starting frontend server..."
    
    # Start frontend in background
    cd /root/complykort/frontend
    timeout $timeout npm run dev &
    FRONTEND_PID=$!
    
    echo "Frontend PID: $FRONTEND_PID"
    echo "Waiting for server to start..."
    
    # Wait for server to be ready or timeout
    for i in {1..15}; do
        sleep 2
        if curl -s --connect-timeout 3 http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Frontend server responding on port 3000"
            PORT=3000
            break
        elif curl -s --connect-timeout 3 http://localhost:3001 > /dev/null 2>&1; then
            # Port 3001 might be taken by backend, try other ports
            continue
        elif curl -s --connect-timeout 3 http://localhost:3002 > /dev/null 2>&1; then
            echo "✅ Frontend server responding on port 3002"
            PORT=3002
            break
        elif curl -s --connect-timeout 3 http://localhost:3003 > /dev/null 2>&1; then
            echo "✅ Frontend server responding on port 3003"
            PORT=3003
            break
        elif curl -s --connect-timeout 3 http://localhost:3004 > /dev/null 2>&1; then
            echo "✅ Frontend server responding on port 3004"
            PORT=3004
            break
        elif curl -s --connect-timeout 3 http://localhost:3005 > /dev/null 2>&1; then
            echo "✅ Frontend server responding on port 3005"
            PORT=3005
            break
        fi
        echo "   Attempt $i: Server not ready yet..."
    done
    
    if [ -z "$PORT" ]; then
        echo "❌ Frontend server did not start within timeout"
        kill $FRONTEND_PID 2>/dev/null
        return 1
    fi
    
    echo "🎉 Frontend server is running on port $PORT"
    
    # Test if it contains our content
    echo "🧪 Testing frontend content..."
    if curl -s --connect-timeout 5 http://localhost:$PORT | grep -q "ComplykOrt"; then
        echo "✅ Frontend content loaded successfully"
        echo "🌐 Access your application at: http://localhost:$PORT"
        echo ""
        echo "📝 Demo Instructions:"
        echo "1. Click 'Login to Dashboard' or 'Try Demo Login'"
        echo "2. Use demo credentials: admin@acme.example.com / demo123!"
        echo "3. View real-time dashboard with PostgreSQL data"
        echo "4. Test logout functionality"
        echo ""
        echo "⏰ Server will run for 60 seconds for testing..."
        sleep 60
    else
        echo "⚠️  Frontend loaded but content may not be complete"
    fi
    
    echo "🛑 Stopping frontend server..."
    kill $FRONTEND_PID 2>/dev/null
    sleep 2
}

# Run the test
test_frontend

echo "✅ Frontend test completed"
