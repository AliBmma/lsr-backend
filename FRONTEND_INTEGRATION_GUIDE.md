# Frontend-Backend Integration Guide

Step-by-step guide to migrate your LSR frontend from localStorage to API calls.

## 📋 Integration Checklist

### Phase 1: Core Setup ✅
- [x] Backend server created and tested
- [x] API service layer created (`frontend/js/api.js`)
- [x] Authentication system ready

### Phase 2: Authentication (Login/Logout)
- [ ] Update `login.html` - Replace localStorage auth with API
- [ ] Update logout functions across all pages
- [ ] Update authentication checks

### Phase 3: Requester Pages
- [ ] Update `requester.html` - Form submission and data loading
- [ ] Update `requester-dashboard.html` - Request listing and management

### Phase 4: Admin Pages
- [ ] Update `admin.html` - Statistics and user management

### Phase 5: Workflow Pages
- [ ] Update `chief.html` - Approval workflows
- [ ] Update `logistic-control.html` - Assignment workflows
- [ ] Update `request-viewer.html` - Request processing
- [ ] Update other workflow pages

### Phase 6: Testing & Polish
- [ ] Test all user roles and workflows
- [ ] Handle error states and loading states
- [ ] Performance optimization

---

## 🚀 Step-by-Step Integration

### Step 1: Include API Service in All Pages

Add this script tag to the `<head>` section of every HTML file:

```html
<script src="js/api.js"></script>
```

### Step 2: Update Login Page (`login.html`)

**Current:** Uses localStorage for authentication
**New:** Uses API authentication

Replace the login form submission handler:

```javascript
// OLD CODE (localStorage)
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  // ... localStorage logic
});

// NEW CODE (API)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');

  // Hide previous messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';

  try {
    const response = await API.auth.login(username, password);

    // Store authentication data
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('username', response.user.username);
    localStorage.setItem('userRole', response.user.role);
    localStorage.setItem('userId', response.user.id);

    // Show success message
    successMessage.style.display = 'block';

    // Redirect based on role
    setTimeout(() => {
      switch (response.user.role) {
        case 'requester':
          window.location.href = 'requester-dashboard.html';
          break;
        case 'admin':
          window.location.href = 'admin.html';
          break;
        case 'chief':
          window.location.href = 'chief.html';
          break;
        case 'logistic-control':
          window.location.href = 'logistic-control.html';
          break;
        case 'request-viewer':
          window.location.href = 'request-viewer-dashboard.html';
          break;
        default:
          window.location.href = 'login.html';
      }
    }, 1000);

  } catch (error) {
    errorMessage.textContent = error.message || 'Login failed';
    errorMessage.style.display = 'block';
  }
});
```

### Step 3: Update Logout Functions

Replace logout functions across all pages:

```javascript
// OLD CODE
function logout() {
  localStorage.removeItem('authenticated');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  window.location.href = 'login.html';
}

// NEW CODE
async function logout() {
  try {
    await API.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}
```

### Step 4: Update Authentication Checks

Replace authentication checks in all pages:

```javascript
// OLD CODE
document.addEventListener('DOMContentLoaded', function() {
  const isAuthenticated = localStorage.getItem('authenticated') === 'true';
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated || userRole !== 'requester') {
    window.location.href = 'login.html';
    return;
  }
  // ... rest of code
});

// NEW CODE
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Verify authentication with backend
    const userResponse = await API.auth.getMe();
    const user = userResponse.user;

    // Store/update user info
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('username', user.username);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', user.id);

    if (user.role !== 'requester') {
      window.location.href = 'login.html';
      return;
    }

    // Continue with page initialization...
    initializePage(user);

  } catch (error) {
    // Authentication failed, redirect to login
    localStorage.clear();
    window.location.href = 'login.html';
  }
});
```

### Step 5: Update Requester Form (`requester.html`)

**Data Loading:** Replace Excel file reading with API calls

```javascript
// OLD CODE - Load from Excel
async function loadDepartmentsAndServiceDetails() {
  // ... Excel reading logic
}

// NEW CODE - Load from API
async function loadDepartmentsAndServiceDetails() {
  try {
    // Load departments
    const deptResponse = await API.departments.getAll({ isActive: true });
    const departments = deptResponse.data;

    // Populate department select
    const departmentSelect = document.getElementById('department');
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.name;
      option.textContent = dept.name;
      departmentSelect.appendChild(option);
    });

    // Load service details
    const serviceResponse = await API.serviceDetails.getAll({ isActive: true });
    const serviceDetails = serviceResponse.data;

    // Populate service details select
    const serviceSelect = document.getElementById('serviceDetailsSelect');
    serviceDetails.forEach(service => {
      const option = document.createElement('option');
      option.value = service.name;
      option.textContent = service.name;
      serviceSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Failed to load data:', error);
    alert('Failed to load form data. Please refresh the page.');
  }
}
```

**Form Submission:** Replace localStorage with API

```javascript
// OLD CODE
function saveData(e) {
  e.preventDefault();
  // ... localStorage logic
  localStorage.setItem("requesterData", JSON.stringify(formData));
  // ... redirect logic
}

// NEW CODE
async function saveData(e) {
  e.preventDefault();

  // ... form validation logic ...

  try {
    const response = await API.requests.create(formData);

    alert(`Request ${response.data.srNumber} submitted successfully!`);

    // Redirect to dashboard
    window.location.href = 'requester-dashboard.html';

  } catch (error) {
    console.error('Failed to submit request:', error);
    alert('Failed to submit request: ' + error.message);
  }
}
```

### Step 6: Update Requester Dashboard (`requester-dashboard.html`)

**Load Requests:** Replace localStorage with API

```javascript
// OLD CODE
function loadUserRequests(username, searchTerm = '') {
  const userRequests = [];
  // ... localStorage logic
}

// NEW CODE
async function loadUserRequests(username, searchTerm = '') {
  try {
    const response = await API.requests.getAll({
      requesterName: username,
      search: searchTerm
    });

    const requests = response.data;
    renderUserRequests(requests);

  } catch (error) {
    console.error('Failed to load requests:', error);
    alert('Failed to load requests. Please refresh the page.');
  }
}
```

### Step 7: Update Admin Dashboard (`admin.html`)

**Load Statistics:** Replace localStorage calculations with API

```javascript
// OLD CODE
function loadAllRequests() {
  const requests = getAllRequests();
  displayRequests(requests);
  updateStats(requests);
}

// NEW CODE
async function loadAllRequests() {
  try {
    const response = await API.stats.getDashboard();
    const stats = response.data;

    updateStats(stats.summary);
    displayRequests(stats.recentRequests);

  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    alert('Failed to load dashboard data. Please refresh the page.');
  }
}
```

### Step 8: Update Workflow Pages

**Chief Approval (`chief.html`):**

```javascript
// OLD CODE
function renderPendingRequests() {
  // ... localStorage logic
}

// NEW CODE
async function renderPendingRequests() {
  try {
    const response = await API.requests.getAll({
      status: 'pending-chief-approval',
      chiefName: localStorage.getItem('username')
    });

    const requests = response.data;
    // ... render logic

  } catch (error) {
    console.error('Failed to load pending requests:', error);
  }
}
```

**Logistic Control (`logistic-control.html`):**

```javascript
// OLD CODE
function renderPendingRequests() {
  // ... localStorage logic
}

// NEW CODE
async function renderPendingRequests() {
  try {
    const response = await API.requests.getAll({
      status: 'pending'
    });

    const requests = response.data;
    // ... render logic

  } catch (error) {
    console.error('Failed to load pending requests:', error);
  }
}
```

### Step 9: Error Handling & Loading States

Add loading indicators and error handling:

```javascript
// Add loading state management
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
  }
}

function hideLoading(elementId) {
  // Loading is hidden when content is replaced
}

// Example usage
async function loadData() {
  showLoading('dataContainer');

  try {
    const response = await API.requests.getAll();
    renderData(response.data);
  } catch (error) {
    document.getElementById('dataContainer').innerHTML =
      '<div style="text-align: center; padding: 20px; color: red;">Failed to load data. Please try again.</div>';
  }
}
```

### Step 10: Real-time Updates (Optional)

For real-time updates, you can add polling or WebSocket support:

```javascript
// Polling for updates (every 30 seconds)
setInterval(async () => {
  if (document.visibilityState === 'visible') {
    try {
      await loadData();
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  }
}, 30000);
```

---

## 🧪 Testing Checklist

After each integration step, test:

1. **Login/Logout:** All user roles can login and logout
2. **Requester Flow:** Create, view, edit requests
3. **Admin Dashboard:** Statistics and user management
4. **Workflow:** Chief approval, logistic assignment, request processing
5. **Error Handling:** Network errors, authentication failures
6. **Data Persistence:** Data survives page refreshes

---

## 🚨 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Update `CORS_ORIGIN` in `backend/.env` to match your frontend URL

### Issue: Authentication Fails
**Solution:** Check JWT_SECRET in `.env` and ensure tokens aren't expired

### Issue: API Calls Return 401
**Solution:** Verify token is being sent in Authorization header

### Issue: Data Not Loading
**Solution:** Check MongoDB connection and ensure data is seeded

---

## 📞 Support

If you encounter issues during integration:

1. Check browser console for errors
2. Verify backend server is running (`http://localhost:5000/api/health`)
3. Test API endpoints directly with curl/Postman
4. Check `BACKEND_SETUP_GUIDE.md` for backend troubleshooting

---

**Ready to start integration? Let's begin with Step 1!**
