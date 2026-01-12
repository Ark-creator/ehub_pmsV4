# Ehub Project Management System - Setup Guide

This guide will help you set up the Ehub Project Management System with PHPMyAdmin/MySQL backend and time-based dark mode.

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- PHPMyAdmin (optional, for database management)

## Backend Setup

### 1. Database Setup

1. **Install MySQL Server**
   - Download and install MySQL Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - During installation, set a root password
   - Start MySQL service

2. **Install PHPMyAdmin (Optional)**
   - Download PHPMyAdmin from [phpmyadmin.net](https://www.phpmyadmin.net/)
   - Extract to your web server directory
   - Access via `http://localhost/phpmyadmin`

### 2. Backend Configuration

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database settings:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ehub_pms
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:5173
   ```

4. **Setup database**
   ```bash
   npm run setup
   ```

5. **Start backend server**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

## Frontend Setup

### 1. Install Dependencies

```bash
# In the root directory
npm install
```

### 2. Configure Environment

Create `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Start Development Server

```bash
npm run dev
```

## Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Supervisor, Fabricator, Client)
- Password hashing with bcrypt
- Secure session management

### 2. Input Validation & Sanitization
- XSS protection
- SQL injection prevention
- Input validation with Joi
- Rate limiting

### 3. Security Headers
- Helmet.js for security headers
- CORS configuration
- Request size limits

## Time-Based Dark Mode

The system automatically switches between light and dark themes based on time:

- **Light Mode**: 6:00 AM - 6:00 PM
- **Dark Mode**: 6:00 PM - 6:00 AM
- **Transition Period**: 30 minutes before each switch
- **Manual Override**: Users can manually set theme to Light, Dark, or Auto

### Theme Configuration

You can customize the theme timing in `hooks/useTimeBasedTheme.ts`:

```typescript
const themeConfig = {
  lightStart: 6,   // 6 AM
  darkStart: 18,   // 6 PM
  transitionDuration: 30 // 30 minutes
};
```

## Database Schema

### Tables Created:
- `users` - User accounts and authentication
- `projects` - Project information and status
- `tasks` - Task management
- `work_logs` - Time tracking and progress
- `materials` - Material inventory

### Default Admin Account:
- **Email**: admin@ehub.com
- **Password**: admin123
- **Role**: Admin

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Work Logs
- `GET /api/worklogs` - List work logs
- `POST /api/worklogs` - Create work log

### Materials
- `GET /api/materials` - List materials
- `POST /api/materials` - Create material

### Users
- `GET /api/users` - List users

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
npm run dev
```

### Database Management
Access PHPMyAdmin at `http://localhost/phpmyadmin` to manage the database directly.

## Production Deployment

### 1. Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production database credentials
- Secure CORS origins

### 2. Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Monitor access logs

### 3. Application Security
- Use HTTPS
- Set secure headers
- Enable rate limiting
- Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Check `FRONTEND_URL` in backend `.env`
   - Verify frontend is running on correct port

3. **Theme Not Switching**
   - Check browser console for errors
   - Verify theme hook is properly imported
   - Clear browser cache

### Support

For issues and questions:
1. Check the console logs
2. Verify all environment variables
3. Ensure all dependencies are installed
4. Check database connectivity

## Features

### ✅ Completed
- [x] Removed Supabase dependencies
- [x] MySQL/Express backend setup
- [x] Security layers (authentication, authorization, input validation)
- [x] Time-based dark mode
- [x] PHPMyAdmin integration
- [x] JWT authentication
- [x] Password hashing
- [x] Rate limiting
- [x] XSS protection
- [x] SQL injection prevention

### 🔄 In Progress
- [ ] Email notifications
- [ ] File upload security
- [ ] Advanced reporting
- [ ] Mobile responsiveness

### 📋 Planned
- [ ] Two-factor authentication
- [ ] Audit logging
- [ ] Advanced analytics
- [ ] API documentation
