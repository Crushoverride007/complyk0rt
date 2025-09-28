#!/bin/bash

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python3 -m http.server" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true

# Navigate to simple frontend directory
cd simple-frontend

# Start a simple HTTP server for the static frontend
echo "🚀 Starting ComplykOrt simple frontend on port 3000..."
echo "📍 Access at: http://95.217.190.154:3000"
python3 -m http.server 3000 --bind 0.0.0.0

