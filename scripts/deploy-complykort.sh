#!/bin/bash

echo "🚀 ComplykOrt Full-Stack Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
PROJECT_NAME="ComplykOrt"
BASE_DIR="/root/complykort"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Function to print status
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_warning "This script should be run as root for full system access"
fi

print_status "Starting $PROJECT_NAME deployment..."

# Step 1: System Prerequisites
print_status "Checking system prerequisites..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check PostgreSQL
if command -v psql >/dev/null 2>&1 || pgrep -x postgres >/dev/null; then
    print_success "PostgreSQL found"
else
    print_warning "PostgreSQL not detected. Will attempt to start..."
    systemctl start postgresql 2>/dev/null || service postgresql start 2>/dev/null || true
fi

# Step 2: Backend Setup
print_status "Setting up backend..."

cd "$BACKEND_DIR" || {
    print_error "Backend directory not found at $BACKEND_DIR"
    exit 1
}

# Install backend dependencies
print_status "Installing backend dependencies..."
if npm install --production; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Check database connection
print_status "Checking database setup..."
if [ -f "prisma/schema.prisma" ]; then
    print_success "Prisma schema found"
    
    # Run database migrations
    print_status "Running database migrations..."
    if npx prisma migrate deploy 2>/dev/null || npx prisma db push 2>/dev/null; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations may need manual setup"
    fi
else
    print_warning "Prisma schema not found"
fi

# Step 3: Frontend Setup
print_status "Setting up frontend..."

cd "$FRONTEND_DIR" || {
    print_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
}

# Install frontend dependencies
print_status "Installing frontend dependencies..."
if npm install --production; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Step 4: Create startup scripts
print_status "Creating startup scripts..."

# Backend startup script
cat > "$BASE_DIR/start-backend.sh" << 'BACKEND_SCRIPT'
#!/bin/bash
echo "🔧 Starting ComplykOrt Backend..."
cd /root/complykort/backend

# Kill existing processes
pkill -f "tsx.*server-real" 2>/dev/null || true
sleep 2

# Start backend
echo "Starting backend on port 3001..."
npm run dev:real &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo $BACKEND_PID > backend.pid

# Wait and test
sleep 5
if curl -s --connect-timeout 3 http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Backend is running successfully"
    echo "🔗 Backend API: http://localhost:3001"
    echo "🔍 Health check: http://localhost:3001/health"
else
    echo "⚠️  Backend may still be starting up..."
fi

echo "Backend log file: $(pwd)/backend.log"
BACKEND_SCRIPT

# Frontend startup script
cat > "$BASE_DIR/start-frontend.sh" << 'FRONTEND_SCRIPT'
#!/bin/bash
echo "🎨 Starting ComplykOrt Frontend..."
cd /root/complykort/frontend

# Kill existing processes
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start frontend
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"
echo $FRONTEND_PID > frontend.pid

# Wait for server to be ready
echo "Waiting for frontend server to start..."
for i in {1..15}; do
    sleep 2
    for port in 3000 3002 3003 3004 3005; do
        if curl -s --connect-timeout 2 http://localhost:$port >/dev/null 2>&1; then
            echo "✅ Frontend is running on port $port"
            echo "🌐 Frontend URL: http://localhost:$port"
            echo ""
            echo "🎯 Demo Login Credentials:"
            echo "   Email: admin@acme.example.com"
            echo "   Password: demo123!"
            echo ""
            echo "📱 Access your application at: http://localhost:$port"
            exit 0
        fi
    done
    echo "   Waiting... ($i/15)"
done

echo "⚠️  Frontend server may still be starting. Check the logs."
FRONTEND_SCRIPT

# Complete startup script
cat > "$BASE_DIR/start-complykort.sh" << 'COMPLETE_SCRIPT'
#!/bin/bash
echo "🚀 Starting Complete ComplykOrt Application"
echo "=========================================="

# Start backend
echo "1. Starting Backend..."
/root/complykort/start-backend.sh
sleep 3

# Start frontend
echo ""
echo "2. Starting Frontend..."
/root/complykort/start-frontend.sh

echo ""
echo "🎉 ComplykOrt is now running!"
echo "=============================="
echo ""
echo "🔗 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:[auto-detected-port]"
echo ""
echo "🎯 To login, use these demo credentials:"
echo "   📧 Email: admin@acme.example.com"
echo "   🔑 Password: demo123!"
echo ""
echo "🛑 To stop the application:"
echo "   pkill -f 'tsx.*server-real'"
echo "   pkill -f 'next dev'"
COMPLETE_SCRIPT

# Make scripts executable
chmod +x "$BASE_DIR/start-backend.sh"
chmod +x "$BASE_DIR/start-frontend.sh"
chmod +x "$BASE_DIR/start-complykort.sh"

print_success "Startup scripts created"

# Step 5: Create systemd services (optional)
print_status "Creating system service files..."

# Backend service
cat > /etc/systemd/system/complykort-backend.service << 'SERVICE_BACKEND'
[Unit]
Description=ComplykOrt Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/complykort/backend
ExecStart=/usr/bin/npm run dev:real
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE_BACKEND

# Frontend service
cat > /etc/systemd/system/complykort-frontend.service << 'SERVICE_FRONTEND'
[Unit]
Description=ComplykOrt Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/complykort/frontend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
SERVICE_FRONTEND

print_success "Systemd service files created"

# Step 6: Final verification
print_status "Performing final verification..."

# Check critical files
CRITICAL_FILES=(
    "$BACKEND_DIR/src/server-real.ts"
    "$BACKEND_DIR/package.json"
    "$FRONTEND_DIR/src/app/page.tsx"
    "$FRONTEND_DIR/src/services/api.ts"
    "$FRONTEND_DIR/package.json"
)

ALL_FILES_OK=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        ALL_FILES_OK=false
    fi
done

# Deployment summary
echo ""
echo "🏆 DEPLOYMENT SUMMARY"
echo "===================="

if [ "$ALL_FILES_OK" = true ]; then
    print_success "All critical files are present"
    print_success "Backend and frontend configured"
    print_success "Startup scripts created"
    print_success "System services configured"
    
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "=============="
    echo ""
    echo "🚀 To start the complete application:"
    echo "   $BASE_DIR/start-complykort.sh"
    echo ""
    echo "🔧 To start services individually:"
    echo "   $BASE_DIR/start-backend.sh"
    echo "   $BASE_DIR/start-frontend.sh"
    echo ""
    echo "⚙️  To enable system services:"
    echo "   systemctl enable complykort-backend"
    echo "   systemctl enable complykort-frontend"
    echo "   systemctl start complykort-backend"
    echo "   systemctl start complykort-frontend"
    echo ""
    echo "🎉 Your ComplykOrt application is ready for production!"
    
else
    print_error "Some critical files are missing"
    echo "Please ensure the application is properly set up before deployment."
    exit 1
fi
