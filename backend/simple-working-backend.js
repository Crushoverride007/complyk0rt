const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple demo data
const users = [
  { id: 1, email: 'admin@acme.example.com', password: 'demo123!', name: 'Alice Johnson' },
  { id: 2, email: 'manager@acme.example.com', password: 'demo123!', name: 'Bob Manager' }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple backend is working!',
    timestamp: new Date().toISOString() 
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token: 'simple-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Dashboard data
app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalOrganizations: 2,
      totalUsers: 4,
      totalProjects: 12,
      totalTasks: 156,
      recentActivity: [
        { id: 1, description: 'User logged in', user: 'Alice', timestamp: new Date().toISOString() },
        { id: 2, description: 'Dashboard accessed', user: 'Bob', timestamp: new Date().toISOString() }
      ],
      complianceHealth: {
        overallScore: 94,
        criticalIssues: 2,
        pendingTasks: 8,
        completedTasks: 148
      }
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('✅ Simple backend running on http://localhost:' + PORT);
  console.log('🔍 Health check: http://localhost:' + PORT + '/health');
  console.log('🔐 Demo login: admin@acme.example.com / demo123!');
});
