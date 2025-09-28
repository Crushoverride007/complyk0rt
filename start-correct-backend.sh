#!/bin/bash

# Kill any existing backend processes
pkill -f "simple-fresh-backend"
pkill -f "tsx.*server-real"

# Wait a moment
sleep 2

# Start the correct backend
cd /root/complykort/backend
npm run dev:real
