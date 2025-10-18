# Quick Start Guide - LSR Backend

Get the backend server running in 5 minutes!

## 🚀 Quick Setup (5 Steps)

### 1. Install Node.js
Download and install from: https://nodejs.org/ (if not already installed)

### 2. Install MongoDB
**Option A - Local (Recommended for development):**
- Windows: Download from https://www.mongodb.com/try/download/community
- macOS: `brew install mongodb-community`
- Linux: Follow MongoDB official docs

**Option B - Cloud (MongoDB Atlas):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start MongoDB (if using local)
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Seed Database & Start Server
```bash
# Seed initial data
node utils/seedData.js

# Start server
npm start
```

## ✅ Verify It's Working

Open browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "LSR Backend Server is running"
}
```

## 🔑 Default Login Credentials

**Admin:**
- Username: `mahmood.saed`
- Password: `scmasiacell`

**Requester:**
- Username: `zaid.nihad`
- Password: `scmasiacell`

**Request Viewer:**
- Username: `laith.talib`
- Password: `scmasiacell`

**Chief:**
- Username: `mohammed.radhwan`
- Password: `scmasiacell`

**Logistic Control:**
- Username: `sarbast.nadhmi`
- Password: `scmasiacell`

## 📝 Test the API

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mahmood.saed","password":"scmasiacell"}'
```

Copy the `token` from the response and use it for authenticated requests:

### Get Requests
```bash
curl http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Common Issues

### MongoDB not starting?
- Windows: Run `services.msc` and start MongoDB service
- macOS/Linux: Check status with `brew services list` or `systemctl status mongod`

### Port 5000 already in use?
- Change `PORT=5001` in `backend/.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### Can't connect to database?
- Check `MONGODB_URI` in `backend/.env`
- Ensure MongoDB is running
- Try: `mongosh` to test connection

## 📚 Next Steps

1. ✅ Backend is running
2. 📖 Read `BACKEND_SETUP_GUIDE.md` for detailed integration
3. 🔗 Integrate with frontend (see guide)
4. 🧪 Test all API endpoints
5. 🚀 Deploy to production

## 🆘 Need Help?

- Check `backend/README.md` for full documentation
- Review `BACKEND_SETUP_GUIDE.md` for detailed setup
- Check troubleshooting section in setup guide

---

**That's it! Your backend server is ready! 🎉**
