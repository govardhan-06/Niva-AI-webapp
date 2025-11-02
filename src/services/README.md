# Niva AI Services

This directory contains all the API service files for the Niva AI web application. Each service is designed to work with the backend API endpoints and includes proper authentication token handling.

## Services Overview

### 🔐 Authentication Service (`auth.js`)
Handles user authentication including login, registration, and token management.

**Key Features:**
- User registration and login
- Token storage and management
- Authentication status checking
- Automatic token attachment to API requests

**Usage:**
```javascript
import { authAPI, tokenManager } from './services/auth';

// Register a new user
const response = await authAPI.register({
  email: 'user@example.com',
  password: 'password123',
  role_type: 'user'
});

// Login user
const loginResponse = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check authentication status
const isAuthenticated = tokenManager.isAuthenticated();
```

### 📚 Course Service (`course.js`)
Manages course-related operations including creation, retrieval, updating, and deletion.

**Available Methods:**
- `createCourse(courseData)` - Create a new course
- `getCourse(courseId)` - Get a specific course
- `getAllCourses(isActive)` - Get all courses (with optional filtering)
- `updateCourse(courseId, updateData)` - Update an existing course
- `deleteCourse(courseId)` - Delete a course

**Usage:**
```javascript
import { courseAPI } from './services/course';

// Create a new course
const newCourse = await courseAPI.createCourse({
  name: 'Introduction to AI',
  description: 'Learn AI basics',
  is_active: true,
  passing_score: 70.0,
  max_score: 100.0,
  syllabus: 'Course syllabus...',
  instructions: 'Course instructions...',
  evaluation_criteria: 'Evaluation criteria...'
});

// Get all active courses
const courses = await courseAPI.getAllCourses(true);
```

### 🧠 Agent Memory Service (`agent_memory.js`)
Handles agent memory operations including adding, retrieving, and deleting memories.

**Available Methods:**
- `addMemory(courseId, memoryData)` - Add a new memory (document or website)
- `deleteMemory(courseId, memoryId)` - Delete a memory
- `getMemoryContent(courseId, memoryId, options)` - Get memory content with optional pagination
- `getMemorySummary(courseId, memoryId)` - Get memory summary

**Usage:**
```javascript
import { memoryAPI } from './services/agent_memory';

// Add a document memory
const memoryResponse = await memoryAPI.addMemory(courseId, {
  type: 'document',
  name: 'Course Manual',
  file: fileObject // File from input
});

// Add a website memory
const websiteMemory = await memoryAPI.addMemory(courseId, {
  type: 'website',
  name: 'AI Resources',
  url: 'https://example.com'
});

// Get memory content with pagination
const content = await memoryAPI.getMemoryContent(courseId, memoryId, {
  limit: 10,  // Number of results per page
  offset: 0   // Offset for pagination (default: 0)
});
```

### 📞 Entrypoint Call Service (`initiate_call.js`)
Handles call initiation for the entrypoint voice API.

**Available Methods:**
- `initiateEntrypointCall(callData)` - Initiate a call with course, agent, and student

**Usage:**
```javascript
import { entrypointAPI } from './services/initiate_call';

// Initiate a call
const callResponse = await entrypointAPI.initiateEntrypointCall({
  course_id: 'course-uuid',
  agent_id: 'agent-uuid', // Optional
  student_id: 'student-uuid' // Optional
});

// Response includes:
// - sip_endpoint: SIP endpoint for the call
// - daily_call_id: Daily call ID
// - room_url: Daily room URL
// - token: Daily room token
// - course_name: Course name
// - agent_name: Agent name
// - student_id: Student ID
```

### 👥 Student Service (`student.js`)
Handles student-related operations.

**Available Methods:**
- `listAllStudents()` - Get a list of all students

**Usage:**
```javascript
import { studentAPI } from './services/student';

// List all students
const { students } = await studentAPI.listAllStudents();
// Response includes array of students with id, first_name, last_name, full_name
```

### 📚 Course Service (Additional Methods)
The course service now includes additional methods beyond the existing ones.

**Additional Methods:**
- `listAllCourses()` - Get a simple list of all courses with basic information

**Usage:**
```javascript
import { courseAPI } from './services/course';

// List all courses
const { courses } = await courseAPI.listAllCourses();
// Response includes array of courses with id, name, description, is_active, language
```

## API Configuration

### Base URL Configuration
Update the `API_BASE_URL` in `auth.js` to match your backend server:

```javascript
const API_BASE_URL = 'http://52.28.190.158/api/v1'; // Update this
```

### Authentication Flow
1. User registers/logs in through the authentication service
2. Token is automatically stored in localStorage
3. All subsequent API calls include the authentication token
4. Token is automatically attached to requests via the `authenticatedApiCall` helper

## Error Handling

All services include comprehensive error handling:

```javascript
try {
  const response = await courseAPI.createCourse(courseData);
  // Handle success
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error (show user-friendly message, etc.)
}
```

## File Upload Support

The memory service supports file uploads using FormData:

```javascript
// For document uploads, the service automatically handles FormData
const response = await memoryAPI.addMemory(courseId, {
  type: 'document',
  name: 'document.pdf',
  file: fileObject // File from <input type="file">
});
```

## Example Usage

See `example-usage.js` for comprehensive examples of how to use each service in your React components.

## Backend API Endpoints

The services are designed to work with these backend endpoints:

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login

### Courses
- `POST /api/v1/course/create/` - Create course
- `POST /api/v1/course/get/` - Get course
- `POST /api/v1/course/all/` - Get all courses
- `POST /api/v1/course/update/` - Update course
- `POST /api/v1/course/delete/` - Delete course

### Agent Memory
- `POST /api/v1/agent-memory/<course_id>/add-memory/` - Add memory
- `DELETE /api/v1/agent-memory/<course_id>/delete-memory/<memory_id>/` - Delete memory
- `GET /api/v1/agent-memory/<course_id>/memory/<memory_id>/content/` - Get content
- `GET /api/v1/agent-memory/<course_id>/memory/<memory_id>/summary/` - Get summary

### Calls
- `POST /api/v1/initiate/entrypoint/` - Initiate entrypoint call

## Security Notes

- All API calls automatically include authentication tokens
- Tokens are stored securely in localStorage
- FormData is properly handled for file uploads
- Error messages are sanitized and user-friendly
- Input validation is performed before API calls

## Troubleshooting

### Common Issues

1. **Authentication errors**: Ensure the user is logged in and the token is valid
2. **File upload issues**: Make sure the file is a valid File object from an input element
3. **CORS errors**: Ensure your backend allows requests from your frontend domain
4. **Network errors**: Check that the API_BASE_URL is correct and the backend is running

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will log all API requests and responses to the console.
