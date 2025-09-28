const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    message: 'Backend accessible externally!',
    timestamp: new Date().toISOString(),
    server: 'external' 
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('External login attempt:', email);
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        token: 'external-token-' + Date.now()
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
        { id: 1, description: 'External access established', user: 'System', timestamp: new Date().toISOString() },
        { id: 2, description: 'User logged in remotely', user: 'Alice', timestamp: new Date().toISOString() }
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
// BIND TO ALL INTERFACES (0.0.0.0) - NOT LOCALHOST
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 External backend running on ALL interfaces');
  console.log('🌐 External access: http://95.217.190.154:' + PORT);
  console.log('🔍 Health check: http://95.217.190.154:' + PORT + '/health');
  console.log('🔐 Demo login: admin@acme.example.com / demo123!');
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo user validation
    const demoUsers = {
      'admin@acme.example.com': { password: 'demo123!', name: 'John Admin', role: 'admin', id: '1' },
      'manager@acme.example.com': { password: 'demo123!', name: 'Jane Manager', role: 'manager', id: '2' }
    };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = demoUsers[email];
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate demo token
    const token = 'demo_token_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Also add the route without /api prefix for compatibility
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo user validation
    const demoUsers = {
      'admin@acme.example.com': { password: 'demo123!', name: 'John Admin', role: 'admin', id: '1' },
      'manager@acme.example.com': { password: 'demo123!', name: 'Jane Manager', role: 'manager', id: '2' }
    };

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = demoUsers[email];
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate demo token
    const token = 'demo_token_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard data endpoint
app.get('/dashboard', (req, res) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization token' });
  }

  const token = authHeader.split(' ')[1];
  if (!token.startsWith('demo_token_')) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Return dashboard data
  res.json({
    user: {
      id: '1',
      email: 'admin@acme.example.com',
      name: 'John Admin',
      role: 'admin'
    },
    stats: {
      totalControls: 156,
      completedControls: 142,
      pendingEvidences: 23,
      upcomingAudits: 3
    },
    recentActivity: [
      {
        id: '1',
        type: 'evidence_uploaded',
        description: 'SOX Control evidence uploaded',
        timestamp: '2025-09-22T18:30:00Z',
        user: 'John Admin'
      },
      {
        id: '2',
        type: 'control_updated',
        description: 'Access Control policy updated',
        timestamp: '2025-09-22T17:15:00Z',
        user: 'Jane Manager'
      }
    ],
    controlsOverview: [
      {
        id: '1',
        name: 'Access Control Management',
        category: 'Security',
        status: 'compliant',
        lastUpdated: '2025-09-22T16:00:00Z'
      },
      {
        id: '2',
        name: 'Data Backup Procedures',
        category: 'Operations',
        status: 'pending',
        lastUpdated: '2025-09-21T14:30:00Z'
      }
    ]
  });
});
