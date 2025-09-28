#!/bin/bash

echo "🔍 ComplykOrt Service Status Check"
echo "=================================="
echo ""

echo "📡 Network Status:"
netstat -tlnp | grep -E ":(3000|3001)" | while read line; do
    echo "  $line"
done

echo ""
echo "🧪 Service Health Checks:"

# Frontend check
echo -n "Frontend (3000): "
if curl -s --connect-timeout 3 http://localhost:3000 > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Backend check  
echo -n "Backend (3001):  "
if curl -s --connect-timeout 3 http://localhost:3001/health > /dev/null; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo ""
echo "🌐 External Access URLs:"
echo "  Frontend: http://95.217.190.154:3000"
echo "  Backend:  http://95.217.190.154:3001/health"
echo ""

# Try to get actual backend response
echo "🔧 Backend Response Sample:"
timeout 5 curl -s http://localhost:3001/health 2>/dev/null | head -3 || echo "No response received"
