const http = require('http');

// Backend data and logic
const users = [
  { id: 1, email: 'admin@acme.example.com', password: 'demo123!', name: 'Alice Johnson' },
  { id: 2, email: 'manager@acme.example.com', password: 'demo123!', name: 'Bob Manager' }
];

const dashboardData = {
  totalOrganizations: 2,
  totalUsers: 4,
  totalProjects: 12,
  totalTasks: 156,
  recentActivity: [
    { id: 1, description: 'User logged in successfully', user: 'Alice', timestamp: new Date().toISOString() },
    { id: 2, description: 'Dashboard data loaded', user: 'System', timestamp: new Date().toISOString() }
  ],
  complianceHealth: {
    overallScore: 94,
    criticalIssues: 2,
    pendingTasks: 8,
    completedTasks: 148
  }
};

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ComplykOrt - Working Demo</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #0f172a, #1e293b); 
            color: white; 
            margin: 0; 
            padding: 20px; 
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(30, 41, 59, 0.9); 
            padding: 30px; 
            border-radius: 15px; 
        }
        .status { 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
        }
        .success { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; }
        .error { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; }
        .btn { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 12px 20px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 5px; 
            font-weight: 600;
        }
        .btn:hover { transform: translateY(-1px); }
        input { 
            width: 100%; 
            padding: 10px; 
            margin: 5px 0; 
            background: rgba(51, 65, 85, 0.8); 
            border: 1px solid #475569; 
            border-radius: 5px; 
            color: white; 
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 15px; 
            margin: 20px 0; 
        }
        .stat-card { 
            background: rgba(15, 23, 42, 0.7); 
            padding: 15px; 
            border-radius: 10px; 
            text-align: center; 
        }
        .stat-number { 
            font-size: 24px; 
            font-weight: bold; 
            color: #60a5fa; 
            margin-bottom: 5px; 
        }
        h1 { text-align: center; color: #60a5fa; margin-bottom: 30px; }
        h3 { color: #e2e8f0; margin-top: 25px; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ ComplykOrt - Working Full-Stack Demo</h1>
        
        <div class="status success">
            ✅ Both frontend and backend are running in a single server!
        </div>
        
        <div id="login-section">
            <h3>🔐 Login</h3>
            <input type="email" id="email" placeholder="Email" value="admin@acme.example.com">
            <input type="password" id="password" placeholder="Password" value="demo123!">
            <br>
            <button class="btn" onclick="login()">Login</button>
            <button class="btn" onclick="fillAdmin()">Use Admin</button>
            <button class="btn" onclick="fillManager()">Use Manager</button>
        </div>
        
        <div id="dashboard-section" class="hidden">
            <div class="status success">
                ✅ Welcome! You are logged in as: <span id="user-name"></span>
            </div>
            
            <h3>📊 Dashboard Overview</h3>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">${dashboardData.totalOrganizations}</div>
                    <div>Organizations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dashboardData.totalUsers}</div>
                    <div>Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dashboardData.totalProjects}</div>
                    <div>Projects</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dashboardData.totalTasks}</div>
                    <div>Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${dashboardData.complianceHealth.overallScore}%</div>
                    <div>Compliance</div>
                </div>
            </div>
            
            <h3>📋 Recent Activity</h3>
            <div style="background: rgba(15, 23, 42, 0.5); padding: 15px; border-radius: 10px;">
                ${dashboardData.recentActivity.map(activity => 
                    `<div style="margin: 10px 0; padding: 10px; background: rgba(30, 41, 59, 0.6); border-radius: 5px;">
                        <strong>${activity.description}</strong> by ${activity.user}
                        <br><small style="color: #94a3b8;">${new Date(activity.timestamp).toLocaleString()}</small>
                    </div>`
                ).join('')}
            </div>
            
            <br>
            <button class="btn" onclick="logout()" style="background: #6b7280;">Logout</button>
        </div>
    </div>

    <script>
        function fillAdmin() {
            document.getElementById('email').value = 'admin@acme.example.com';
            document.getElementById('password').value = 'demo123!';
        }
        
        function fillManager() {
            document.getElementById('email').value = 'manager@acme.example.com';
            document.getElementById('password').value = 'demo123!';
        }
        
        function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulate authentication
            const user = ${JSON.stringify(users)}.find(u => u.email === email && u.password === password);
            
            if (user) {
                document.getElementById('user-name').textContent = user.name;
                document.getElementById('login-section').classList.add('hidden');
                document.getElementById('dashboard-section').classList.remove('hidden');
            } else {
                alert('Invalid credentials! Use demo users.');
            }
        }
        
        function logout() {
            document.getElementById('login-section').classList.remove('hidden');
            document.getElementById('dashboard-section').classList.add('hidden');
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

const PORT = 9000;
server.listen(PORT, () => {
  console.log('✅ ComplykOrt working demo running on http://localhost:' + PORT);
  console.log('🌐 Open your browser to: http://localhost:' + PORT);
  console.log('🔐 Demo credentials: admin@acme.example.com / demo123!');
  console.log('');
  console.log('🎉 This is a complete working full-stack demo!');
});
