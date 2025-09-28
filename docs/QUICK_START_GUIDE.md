# 🚀 ComplykOrt - Quick Start Guide

## ⚡ **Start Application (30 seconds)**
```bash
/root/complykort/start-complykort.sh
```

## 🔐 **Demo Login**
- **URL**: `http://localhost:[auto-detected-port]`
- **Email**: `admin@acme.example.com`
- **Password**: `demo123!`

## 🧪 **Test Everything**
```bash
/root/complykort/complete-application-test.sh
```

## 🛑 **Stop Application**
```bash
pkill -f 'tsx.*server-real'
pkill -f 'next dev'
```

## 📁 **Key Files**
- Frontend: `/root/complykort/frontend/src/app/page.tsx`
- Backend: `/root/complykort/backend/src/server-real.ts`
- Database: PostgreSQL on port 5432
- API: http://localhost:3001

**That's it! Your full-stack application is ready!** 🎉
