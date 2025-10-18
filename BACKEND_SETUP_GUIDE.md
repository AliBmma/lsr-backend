# LSR Backend Server - Complete Setup Guide

This guide will help you set up and run the backend server for the Asiacell LSR (Logistics Service Request) system.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Running the Server](#running-the-server)
5. [Testing the API](#testing-the-api)
6. [Integrating with Frontend](#integrating-with-frontend)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v4.4 or higher)
   - **Option A - Local Installation:**
     - Windows: https://www.mongodb.com/try/download/community
     - macOS: `brew install mongodb-community`
     - Linux: Follow official MongoDB docs
   
   - **Option B - MongoDB Atlas (Cloud):**
     - Create free account: https://www.mongodb.com/cloud/atlas
     - Create a cluster and get connection string

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

---

## 📦 Installation Steps

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- multer
- xlsx
- socket.io

### Step 3: Configure Environment Variables

The `.env` file is already created. Update it if needed:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lsr_database

# JWT Secret (Change this in production!)
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345

# JWT Expiration
JWT_EXPIRE=7d

# CORS Origin (Frontend URL)
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

#### Windows

1. **Start MongoDB Service:**
   ```bash
   net start MongoDB
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongo --version
   ```

#### macOS/Linux

1. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongosh --version
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/lsr_database`)
4. Update `MONGODB_URI` in `.env` with your connection string

### Seed Initial Data

Run the seeding script to populate the database with default users, departments, and service details:

```bash
node utils/seedData.js
```

**Expected Output:**
```
🌱 Starting database seeding...

Clearing existing data...
✓ Existing data cleared

Seeding users...
✓ Created user: zaid.nihad (requester)
✓ Created user: laith.talib (request-viewer)
...
✓ 12 users created

Seeding departments...
✓ Created department: Technology
...
✓ 6 departments created

Seeding service details...
✓ Created service detail: Equipment Installation
...
✓ 10 service details created

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ Database seeding completed successfully!            ║
║                                                           ║
║   Default Admin Credentials:                             ║
║   Username: mahmood.saed                                  ║
║   Password: scmasiacell                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🚀 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 LSR Backend Server Running                          ║
║                                                           ║
║   Environment: development                                ║
║   Port: 5000                                              ║
║   Database: MongoDB                                       ║
║                                                           ║
║   API Endpoints:                                          ║
║   • http://localhost:5000/api/auth                        ║
║   • http://localhost:5000/api/users                       ║
║   • http://localhost:5000/api/requests                    ║
║   • http://localhost:5000/api/machines                    ║
║   • http://localhost:5000/api/logistics                   ║
║   • http://localhost:5000/api/departments                 ║
║   • http://localhost:5000/api/service-details             ║
║   • http://localhost:5000/api/stats                       ║
║                                                           ║
║   Health Check: http://localhost:5000/api/health          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🧪 Testing the API

### 1. Health Check

Open browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "LSR Backend Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Login Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mahmood.saed",
    "password": "scmasiacell"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "mahmood.saed",
    "role": "admin",
    "department": ""
  }
}
```

### 3. Get Requests (Authenticated)

```bash
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman or Thunder Client

1. **Install Postman:** https://www.postman.com/downloads/
2. **Import Collection:** Create requests for each endpoint
3. **Set Authorization:** Use Bearer Token with JWT from login

---

## 🔗 Integrating with Frontend

### Step 1: Create API Service File

Create `frontend/js/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API call wrapper
const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  login: (username, password) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  
  getMe: () => apiCall('/auth/me')
};

// Requests API
const requestsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/requests?${params}`);
  },
  
  getById: (id) => apiCall(`/requests/${id}`),
  
  getBySR: (srNumber) => apiCall(`/requests/sr/${srNumber}`),
  
  create: (data) => 
    apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  
  update: (id, data) => 
    apiCall(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  approve: (id) => 
    apiCall(`/requests/${id}/approve`, { method: 'POST' }),
  
  reject: (id) => 
    apiCall(`/requests/${id}/reject`, { method: 'POST' }),
  
  sendBack: (id, note) => 
    apiCall(`/requests/${id}/send-back`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),
  
  assign: (id, assignedTo) => 
    apiCall(`/requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo })
    })
};

// Export APIs
window.API = {
  auth: authAPI,
  requests: requestsAPI
};
```

### Step 2: Update Login Page

In `login.html`, replace localStorage authentication with API call:

```javascript
// Replace the login form submission handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await API.auth.login(username, password);
    
    // Store token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('username', response.user.username);
    localStorage.setItem('userRole', response.user.role);
    
    // Redirect based on role
    switch (response.user.role) {
      case 'requester':
        window.location.href = 'requester.html';
        break;
      case 'admin':
        window.location.href = 'admin.html';
        break;
      // ... other roles
    }
  } catch (error) {
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').textContent = error.message;
  }
});
```

### Step 3: Update Other Pages

Replace localStorage operations with API calls in all HTML files.

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. Check MongoDB URI in `.env`
3. Try connecting with MongoDB Compass to verify

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change PORT in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Issue: JWT Authentication Errors

**Error:** `Not authorized to access this route`

**Solutions:**
1. Verify token is being sent in Authorization header
2. Check token hasn't expired (default: 7 days)
3. Ensure JWT_SECRET matches between requests

### Issue: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**
1. Update CORS_ORIGIN in `.env` to match frontend URL
2. Ensure frontend is running on the specified origin
3. Check browser console for specific CORS error

### Issue: Seeding Script Fails

**Error:** Various errors during `node utils/seedData.js`

**Solutions:**
1. Ensure MongoDB is running
2. Check database connection string
3. Clear database manually if needed:
   ```bash
   mongosh
   use lsr_database
   db.dropDatabase()
   ```

---

## 📚 Additional Resources

- **MongoDB Documentation:** https://docs.mongodb.com/
- **Express.js Guide:** https://expressjs.com/
- **JWT Introduction:** https://jwt.io/introduction
- **Mongoose Docs:** https://mongoosejs.com/docs/

---

## 🎯 Next Steps

1. ✅ Install prerequisites
2. ✅ Set up database
3. ✅ Run seeding script
4. ✅ Start backend server
5. ✅ Test API endpoints
6. ✅ Integrate with frontend
7. 🔄 Migrate localStorage to API calls
8. 🚀 Deploy to production

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review backend/README.md
- Contact the development team

---

**Good luck with your LSR Backend Server setup! 🚀**
