const http = require('http');

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>ComplykOrt - External Demo</title>
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
            max-width: 900px; 
            margin: 0 auto; 
            background: rgba(30, 41, 59, 0.9); 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        h1 { 
            text-align: center; 
            background: linear-gradient(135deg, #60a5fa, #3b82f6);
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            font-size: 2.5em; 
            margin-bottom: 30px; 
        }
        .status { 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0; 
            font-weight: 500;
        }
        .success { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; }
        .error { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; }
        .info { background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; }
        .btn { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 12px 20px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin: 5px; 
            font-weight: 600;
            transition: transform 0.2s ease;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3); }
        input { 
            width: 100%; 
            padding: 12px; 
            margin: 8px 0; 
            background: rgba(51, 65, 85, 0.8); 
            border: 1px solid #475569; 
            border-radius: 8px; 
            color: white; 
            font-size: 14px;
        }
        input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 20px; 
            margin: 25px 0; 
        }
        .stat-card { 
            background: rgba(15, 23, 42, 0.7); 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center; 
            border: 1px solid rgba(71, 85, 105, 0.3);
            transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-number { 
            font-size: 28px; 
            font-weight: bold; 
            color: #60a5fa; 
            margin-bottom: 8px; 
        }
        .stat-label { 
            color: #94a3b8; 
            font-size: 13px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        h3 { color: #e2e8f0; margin: 25px 0 15px 0; font-size: 1.4em; }
        .hidden { display: none; }
        .activity-item {
            background: rgba(30, 41, 59, 0.6);
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #3b82f6;
        }
        .spinner {
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .url-display {
            background: rgba(15, 23, 42, 0.8);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            border: 1px solid #475569;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ ComplykOrt - External Access Demo</h1>
        
        <div id="connection-status" class="status info">
            🔄 Checking external backend connection...
        </div>
        
        <div class="url-display">
            <strong>Frontend:</strong> http://95.217.190.154:9000<br>
            <strong>Backend API:</strong> http://95.217.190.154:3001
        </div>
        
        <div id="login-section" style="display: none;">
            <h3>🔐 Login</h3>
            <input type="email" id="email" placeholder="Email" value="admin@acme.example.com">
            <input type="password" id="password" placeholder="Password" value="demo123!">
            <br>
            <button class="btn" onclick="login()">Login</button>
            <button class="btn" onclick="fillAdmin()">Use Admin Demo</button>
            <button class="btn" onclick="fillManager()">Use Manager Demo</button>
        </div>
        
        <div id="loading" class="hidden" style="text-align: center; padding: 20px;">
            <div class="spinner"></div>
            <p>Authenticating...</p>
        </div>
        
        <div id="dashboard-section" class="hidden">
            <div class="status success">
                ✅ Welcome! You are logged in as: <span id="user-name"></span>
                <br><small>Accessing external backend at 95.217.190.154:3001</small>
            </div>
            
            <h3>📊 Dashboard Overview</h3>
            <div id="dashboard-stats" class="stats"></div>
            
            <h3>📋 Recent Activity</h3>
            <div id="dashboard-activity"></div>
            
            <br>
            <button class="btn" onclick="logout()" style="background: #6b7280;">Logout</button>
            <button class="btn" onclick="testBackend()">Test Backend Connection</button>
        </div>
    </div>

    <script>
        const API_BASE = 'http://95.217.190.154:3001';
        let currentUser = null;
        let currentToken = null;

        // Check backend status on load
        window.onload = function() {
            checkBackend();
        };

        async function checkBackend() {
            try {
                const response = await fetch(API_BASE + '/health', {
                    method: 'GET',
                    mode: 'cors'
                });
                const data = await response.json();
                
                if (data.status === 'OK') {
                    document.getElementById('connection-status').innerHTML = 
                        '✅ External backend connected successfully!<br><small>Server: ' + 
                        data.server + ' | Message: ' + data.message + '</small>';
                    document.getElementById('connection-status').className = 'status success';
                    document.getElementById('login-section').style.display = 'block';
                } else {
                    throw new Error('Backend response not OK');
                }
            } catch (error) {
                document.getElementById('connection-status').innerHTML = 
                    '❌ Cannot connect to external backend at 95.217.190.154:3001<br>' +
                    '<small>Error: ' + error.message + '</small>';
                document.getElementById('connection-status').className = 'status error';
                
                // Show login anyway for demo
                setTimeout(() => {
                    document.getElementById('login-section').style.display = 'block';
                }, 2000);
            }
        }

        function fillAdmin() {
            document.getElementById('email').value = 'admin@acme.example.com';
            document.getElementById('password').value = 'demo123!';
        }
        
        function fillManager() {
            document.getElementById('email').value = 'manager@acme.example.com';
            document.getElementById('password').value = 'demo123!';
        }
        
        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                alert('Please enter email and password');
                return;
            }

            showLoading(true);

            try {
                const response = await fetch(API_BASE + '/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }),
                    mode: 'cors'
                });

                const data = await response.json();

                if (data.success) {
                    currentUser = data.data.user;
                    currentToken = data.data.token;
                    
                    document.getElementById('user-name').textContent = currentUser.name;
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('dashboard-section').style.display = 'block';
                    
                    loadDashboard();
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                alert('Login error: ' + error.message + '\\n\\nThis might be a CORS issue or network problem.');
            } finally {
                showLoading(false);
            }
        }

        async function loadDashboard() {
            try {
                const response = await fetch(API_BASE + '/api/dashboard/overview', {
                    mode: 'cors'
                });
                const result = await response.json();
                
                if (result.success) {
                    const data = result.data;
                    
                    document.getElementById('dashboard-stats').innerHTML = \`
                        <div class="stat-card">
                            <div class="stat-number">\${data.totalOrganizations}</div>
                            <div class="stat-label">Organizations</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.totalUsers}</div>
                            <div class="stat-label">Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.totalProjects}</div>
                            <div class="stat-label">Projects</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.totalTasks}</div>
                            <div class="stat-label">Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">\${data.complianceHealth.overallScore}%</div>
                            <div class="stat-label">Compliance</div>
                        </div>
                    \`;
                    
                    const activityHtml = data.recentActivity.map(activity => 
                        \`<div class="activity-item">
                            <strong>\${activity.description}</strong> by \${activity.user}
                            <br><small style="color: #94a3b8;">\${new Date(activity.timestamp).toLocaleString()}</small>
                        </div>\`
                    ).join('');
                    
                    document.getElementById('dashboard-activity').innerHTML = activityHtml;
                }
            } catch (error) {
                console.error('Dashboard load error:', error);
                document.getElementById('dashboard-activity').innerHTML = 
                    '<div class="status error">Failed to load dashboard data: ' + error.message + '</div>';
            }
        }

        async function testBackend() {
            try {
                const response = await fetch(API_BASE + '/health');
                const data = await response.json();
                alert('Backend test successful!\\n\\n' + JSON.stringify(data, null, 2));
            } catch (error) {
                alert('Backend test failed:\\n' + error.message);
            }
        }
        
        function logout() {
            currentUser = null;
            currentToken = null;
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
            document.getElementById('login-section').style.display = show ? 'none' : 'block';
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  // Add CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

const PORT = 9000;
// BIND TO ALL INTERFACES - NOT LOCALHOST
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 External frontend running on ALL interfaces');
  console.log('🌐 External access: http://95.217.190.154:' + PORT);
  console.log('🎯 Demo ready with external backend integration!');
});
