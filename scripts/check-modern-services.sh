#!/bin/bash

echo "🔍 ComplykOrt Service Status Check"
echo "=================================="

# Check Frontend
echo ""
echo "📱 Frontend Service (Port 3000):"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "error")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: ONLINE"
    echo "🌐 External URL: http://95.217.190.154:3000"
    
    # Check if it's the new modern design
    CONTENT=$(curl -s http://localhost:3000/ | head -5)
    if echo "$CONTENT" | grep -q "The Compliance Platform for Modern Teams"; then
        echo "🎨 Design: Modern Next.js-inspired theme ✨"
    else
        echo "🎨 Design: Basic theme"
    fi
else
    echo "❌ Frontend: OFFLINE (Status: $FRONTEND_STATUS)"
fi

# Check Backend
echo ""
echo "🔧 Backend API Service (Port 3001):"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null || echo "error")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend API: ONLINE"
    echo "🌐 External URL: http://95.217.190.154:3001"
    
    # Get backend info
    BACKEND_INFO=$(curl -s http://localhost:3001/health 2>/dev/null)
    echo "📊 Status: $(echo "$BACKEND_INFO" | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ Backend API: OFFLINE (Status: $BACKEND_STATUS)"
fi

# Check running processes
echo ""
echo "🔄 Running Processes:"
FRONTEND_PID=$(ps aux | grep "python3.*http.server.*3000" | grep -v grep | awk '{print $2}' | head -1)
BACKEND_PID=$(ps aux | grep "tsx.*server-simple" | grep -v grep | awk '{print $2}' | head -1)

if [ -n "$FRONTEND_PID" ]; then
    echo "📱 Frontend PID: $FRONTEND_PID"
else
    echo "📱 Frontend: No process found"
fi

if [ -n "$BACKEND_PID" ]; then
    echo "🔧 Backend PID: $BACKEND_PID"
else
    echo "🔧 Backend: No process found"
fi

# Overall status
echo ""
echo "🏁 Overall Status:"
if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
    echo "🟢 All services are ONLINE and accessible"
    echo ""
    echo "🚀 Access your ComplykOrt platform:"
    echo "   Frontend: http://95.217.190.154:3000"
    echo "   Backend:  http://95.217.190.154:3001"
    echo ""
    echo "💡 Features:"
    echo "   • Next.js-inspired dark theme design"
    echo "   • Modern gradient UI with smooth animations"
    echo "   • Responsive dashboard with compliance widgets"
    echo "   • Professional navigation and hero section"
    echo "   • Real-time demo data and interactions"
elif [ "$FRONTEND_STATUS" = "200" ]; then
    echo "🟡 Frontend ONLINE, Backend OFFLINE"
elif [ "$BACKEND_STATUS" = "200" ]; then
    echo "🟡 Backend ONLINE, Frontend OFFLINE"
else
    echo "🔴 Both services OFFLINE"
fi

echo ""
echo "🔧 Management commands:"
if [ -n "$FRONTEND_PID" ] || [ -n "$BACKEND_PID" ]; then
    echo "   Stop services: kill $FRONTEND_PID $BACKEND_PID"
fi
echo "   Restart services: ./start-both-services.sh"
echo "   View logs: tail -f frontend.log backend.log"

