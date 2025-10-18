# LSR Backend Server

Backend API server for Asiacell Logistics Service Request (LSR) System.

## Features

- **RESTful API** with Express.js
- **MongoDB Database** with Mongoose ODM
- **JWT Authentication** for secure access
- **Role-Based Access Control** (RBAC)
- **Real-time Updates** support
- **Comprehensive API Endpoints** for all LSR operations

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before running the backend server, ensure you have:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) installed and running
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or use the existing `.env` file)
   - Update the values as needed:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lsr_database
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## Database Setup

### Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### Seed Initial Data

Populate the database with default users, departments, and service details:

```bash
node utils/seedData.js
```

This will create:
- **12 default users** with different roles
- **6 default departments**
- **10 sample service details**

**Default Admin Credentials:**
- Username: `mahmood.saed`
- Password: `scmasiacell`

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/chiefs` - Get all chief users
- `GET /api/users/viewers` - Get all request viewers
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/activate` - Activate user (Admin)
- `PUT /api/users/:id/deactivate` - Deactivate user (Admin)

### Requests
- `GET /api/requests` - Get all requests (filtered by role)
- `GET /api/requests/:id` - Get single request
- `GET /api/requests/sr/:srNumber` - Get request by SR number
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request (Admin)
- `POST /api/requests/:id/approve` - Approve request (Chief)
- `POST /api/requests/:id/reject` - Reject request (Chief)
- `POST /api/requests/:id/send-back` - Send back to requester
- `POST /api/requests/:id/assign` - Assign to viewer (Logistic Control)

### Machines
- `GET /api/machines` - Get all machine data
- `GET /api/machines/request/:requestId` - Get by request ID
- `GET /api/machines/sr/:srNumber` - Get by SR number
- `POST /api/machines` - Create machine data
- `PUT /api/machines/:id` - Update machine data
- `PUT /api/machines/request/:requestId` - Update by request ID
- `DELETE /api/machines/:id` - Delete machine data (Admin)
- `POST /api/machines/:id/approve-work` - Approve work (Chief)
- `POST /api/machines/:id/approve-completion` - Approve completion (Chief)

### Logistics
- `GET /api/logistics` - Get all logistics
- `GET /api/logistics/request/:requestId` - Get by request ID
- `GET /api/logistics/sr/:srNumber` - Get by SR number
- `POST /api/logistics` - Create logistic data (finalize)
- `PUT /api/logistics/:id` - Update logistic data
- `PUT /api/logistics/request/:requestId` - Update by request ID
- `DELETE /api/logistics/:id` - Delete logistic data (Admin)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create department (Admin)
- `PUT /api/departments/:id` - Update department (Admin)
- `DELETE /api/departments/:id` - Delete department (Admin)

### Service Details
- `GET /api/service-details` - Get all service details
- `GET /api/service-details/:id` - Get single service detail
- `POST /api/service-details` - Create service detail (Admin)
- `POST /api/service-details/bulk` - Create multiple service details (Admin)
- `PUT /api/service-details/:id` - Update service detail (Admin)
- `DELETE /api/service-details/:id` - Delete service detail (Admin)

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/user/:username` - Get user-specific statistics
- `GET /api/stats/reports` - Get detailed reports with filters

### Health Check
- `GET /api/health` - Server health check

## User Roles

1. **requester** - Create and manage service requests
2. **request-viewer** - View and process assigned requests
3. **supervisor** - Supervise and monitor all requests
4. **logistic-control** - Assign requests to viewers
5. **admin** - Full system access and user management
6. **chief** - Approve/reject requests from team members
7. **store-keeper** - Manage warehouse operations
8. **store-keeper-officer** - Warehouse officer operations

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example Login Request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "mahmood.saed",
    "password": "scmasiacell"
  }'
```

### Example Authenticated Request:
```bash
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Success Responses

Successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

## Database Models

### User
- username, password, role, department, isActive

### Request
- srNumber, department, requesterName, chiefName, serviceDetail, details, warehouseOfficerNeeded, warehouseOfficer, requestDate, isTransit, status, assignedTo

### Machine
- requestId, srNumber, machines[], logisticOfficer, notes, status, completeWorkDate

### Logistic
- requestId, srNumber, machines[], logisticOfficer, totalPrice, completeWorkDate, status

### Department
- name, isDefault, isActive

### ServiceDetail
- name, category, isActive

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables
```

### Adding New Features

1. Create model in `models/`
2. Create routes in `routes/`
3. Add middleware if needed in `middleware/`
4. Register routes in `server.js`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in `.env`
- Or kill the process using the port

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header format

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong JWT_SECRET
3. Configure proper CORS_ORIGIN
4. Use MongoDB Atlas or similar for database
5. Set up proper logging
6. Enable HTTPS
7. Use process manager (PM2)

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name lsr-backend
pm2 save
pm2 startup
```

## Support

For issues or questions, contact the development team.

## License

Proprietary - Asiacell
