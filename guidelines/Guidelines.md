# Ehub PMS Development Guidelines

Comprehensive guidelines for developing, deploying, and maintaining the Ehub Project Management System.

## Table of Contents

- [General Development Guidelines](#general-development-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Security Best Practices](#security-best-practices)
- [Deployment Guidelines](#deployment-guidelines)
- [Scalability Guidelines](#scalability-guidelines)
- [Performance Optimization](#performance-optimization)
- [Testing Guidelines](#testing-guidelines)

---

## General Development Guidelines

### Code Structure

- **Keep files small and focused**: Single responsibility principle
- **Component organization**: Group related components in folders
- **Helper functions**: Extract reusable logic into utility files
- **Type safety**: Use TypeScript types for all props and functions
- **Avoid absolute positioning**: Prefer responsive layouts with Flexbox/Grid
- **Refactor as you go**: Keep code clean and maintainable

### File Organization

```
components/
  ├── auth/           # Authentication components
  ├── projects/       # Project-related components
  ├── tasks/          # Task management components
  ├── users/          # User management components
  └── ui/             # Reusable UI components (shared across app)
utils/                # Utility functions and helpers
types/                 # TypeScript type definitions
hooks/                 # Custom React hooks
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserManagement.tsx`)
- **Files**: Match component name exactly
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `ProjectData`)

### Code Formatting

- Use ESLint and Prettier for consistent formatting
- 2-space indentation
- Single quotes for strings (JavaScript/TypeScript)
- Trailing commas in multi-line objects/arrays
- Max line length: 100 characters

---

## Code Quality Standards

### TypeScript Best Practices

1. **Always define types**: No `any` types unless absolutely necessary
2. **Use interfaces for objects**: Prefer interfaces over type aliases for object shapes
3. **Optional properties**: Mark optional with `?`
4. **Union types**: Use for constrained value sets

```typescript
// Good
interface User {
  id: string;
  name: string;
  email?: string;
  role: 'admin' | 'supervisor' | 'fabricator';
}

// Bad
const user: any = { ... };
```

### React Best Practices

1. **Functional Components**: Always use functional components with hooks
2. **Custom Hooks**: Extract reusable logic into custom hooks
3. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
4. **Error Boundaries**: Implement error boundaries for robust error handling
5. **Loading States**: Always show loading indicators for async operations

```typescript
// Good
const UserCard = memo(({ user }: { user: User }) => {
  const [loading, setLoading] = useState(false);
  // ...
});

// Bad
class UserCard extends Component { ... }
```

### Component Design

1. **Single Responsibility**: Each component should do one thing well
2. **Props Validation**: Use TypeScript for prop validation
3. **Default Props**: Provide sensible defaults
4. **Composition over Inheritance**: Prefer component composition

### Error Handling

1. **Try-Catch Blocks**: Always wrap async operations
2. **User-Friendly Messages**: Display clear error messages
3. **Logging**: Log errors for debugging but don't expose sensitive data
4. **Graceful Degradation**: Handle failures gracefully

```typescript
// Good
try {
  const result = await apiService.getUsers();
  setUsers(result.data);
} catch (error) {
  console.error('Failed to fetch users:', error);
  toast.error('Unable to load users. Please try again.');
}
```

---

## Architecture & Design Patterns

### API Service Pattern

- **Centralized API calls**: Use `apiService.ts` for all backend communication
- **Error handling**: Consistent error handling across all API calls
- **Token management**: Centralized authentication token handling
- **Request/Response types**: Define types for all API interactions

### State Management

- **Local State**: Use `useState` for component-local state
- **Global State**: Use React Context for shared state (if needed)
- **Server State**: Fetch on mount, cache appropriately
- **Form State**: Use `react-hook-form` for form management

### Data Flow

```
User Action → Component Handler → API Service → Backend → Database
                                      ↓
                                   Response → Update State → Re-render
```

### Component Patterns

1. **Container/Presenter**: Separate logic from presentation
2. **Higher-Order Components**: For cross-cutting concerns (logging, auth)
3. **Render Props**: For sharing component logic (avoid if possible)
4. **Custom Hooks**: For reusable stateful logic

---

## Security Best Practices

### Authentication & Authorization

1. **JWT Tokens**: Store in memory or httpOnly cookies (never localStorage for sensitive apps)
2. **Token Expiration**: Implement token refresh mechanism
3. **Role-Based Access**: Always verify user role on backend
4. **Password Security**: 
   - Minimum 8 characters (enforce on frontend)
   - Use bcrypt for hashing (backend handles)
   - Never log passwords

### Input Validation

1. **Client-Side**: Validate all user inputs with Zod or similar
2. **Server-Side**: Always validate on backend (never trust client)
3. **Sanitization**: Sanitize inputs to prevent XSS
4. **SQL Injection**: Use parameterized queries (already implemented)

### Data Protection

1. **Sensitive Data**: Never log passwords, tokens, or PII
2. **HTTPS Only**: Always use HTTPS in production
3. **CORS**: Configure strict CORS policies
4. **Security Headers**: Implement security headers (configured in nginx)

### Environment Variables

```bash
# Never commit these:
.env
.env.local
.env.production

# Always commit these templates:
env.example
env.production.template
```

---

## Deployment Guidelines

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Security secrets changed from defaults
- [ ] SSL certificates configured
- [ ] Error logging and monitoring setup
- [ ] Backup strategy implemented
- [ ] Performance testing completed
- [ ] Security audit performed

### Deployment Process

1. **Development** → Test locally
2. **Staging** → Deploy to staging environment
3. **QA Testing** → Full regression testing
4. **Production** → Deploy to production with monitoring

### Rollback Strategy

- Keep previous Docker images tagged
- Database migrations should be reversible
- Feature flags for gradual rollouts
- Monitor error rates after deployment

### Environment Configuration

- **Development**: `.env` file (gitignored)
- **Staging**: Environment variables in platform
- **Production**: Secure secrets management (AWS Secrets Manager, etc.)

---

## Scalability Guidelines

### Database Scaling

1. **Indexes**: Ensure all query columns are indexed
2. **Connection Pooling**: Already configured (max 200 connections)
3. **Query Optimization**: Avoid N+1 queries, use joins
4. **Read Replicas**: For read-heavy workloads

### Application Scaling

1. **Stateless Design**: Backend should be stateless
2. **Horizontal Scaling**: Use Docker Compose scaling
3. **Load Balancing**: Nginx automatically balances across instances
4. **Caching**: Implement Redis for session storage and caching

### Performance Targets

- **API Response Time**: < 200ms for simple queries
- **Page Load Time**: < 2s for initial load
- **Database Queries**: < 100ms for simple queries
- **Concurrent Users**: Support 100+ concurrent users per instance

### Monitoring

- Track API response times
- Monitor database query performance
- Track error rates and types
- Monitor resource usage (CPU, memory)
- Set up alerts for critical metrics

---

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Use React.lazy for route-based splitting
2. **Image Optimization**: Compress images, use WebP format
3. **Bundle Size**: Monitor with `npm run build -- --analyze`
4. **Caching**: Cache static assets (configured in nginx)
5. **Memoization**: Use React.memo, useMemo, useCallback appropriately

### Backend Optimization

1. **Database Indexes**: Index foreign keys and frequently queried columns
2. **Query Optimization**: Use EXPLAIN to analyze slow queries
3. **Connection Pooling**: Reuse database connections
4. **Caching**: Cache frequently accessed data
5. **Async Operations**: Use async/await properly

### Network Optimization

1. **Compression**: Gzip enabled in nginx
2. **CDN**: Serve static assets via CDN
3. **API Response Size**: Minimize payload sizes
4. **HTTP/2**: Enable HTTP/2 in nginx

---

## Testing Guidelines

### Unit Testing

- Test utility functions
- Test custom hooks
- Test API service methods
- Aim for 80%+ code coverage

### Integration Testing

- Test API endpoints
- Test database operations
- Test authentication flows
- Test error scenarios

### E2E Testing

- Test critical user flows
- Test cross-browser compatibility
- Test mobile responsiveness

### Manual Testing Checklist

- [ ] Login/Logout flows
- [ ] CRUD operations for all entities
- [ ] Role-based access control
- [ ] Form validation
- [ ] Error handling
- [ ] Responsive design
- [ ] Browser compatibility

---

## Git & Version Control

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `hotfix/*`: Critical bug fixes

### Commit Messages

Follow conventional commits:
```
feat: Add supervisor login support
fix: Resolve user not found error
docs: Update deployment guide
refactor: Optimize API service
```

### Code Review

- All code must be reviewed before merging
- Test all changes locally
- Verify no security issues
- Check performance impact

---

## Design System Guidelines

### Component Library

Use consistent UI components from `components/ui/`:
- Buttons: Primary, Secondary, Destructive variants
- Forms: Consistent input, select, checkbox styling
- Cards: Standard card layout for content
- Tables: Sortable, paginated tables

### Color Scheme

- Primary: Brand color (accent)
- Secondary: Supporting colors
- Success: Green for positive actions
- Error: Red for errors and warnings
- Muted: Gray for secondary text

### Typography

- Base font size: 14px
- Headings: Archivo Black for titles
- Body: System font stack
- Date formats: Use date-fns for consistent formatting

### Spacing

- Use Tailwind spacing scale (4, 8, 12, 16, 24, 32, etc.)
- Consistent padding/margins across components

---

## Accessibility Guidelines

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: All interactive elements should be keyboard accessible
4. **Color Contrast**: Ensure WCAG AA compliance (4.5:1 ratio)
5. **Focus Indicators**: Visible focus states for all interactive elements

---

## Documentation Standards

### Code Comments

- Explain "why" not "what"
- Comment complex logic
- Update comments when code changes
- Use JSDoc for function documentation

### README Files

- Clear setup instructions
- Environment variable documentation
- API endpoint documentation
- Troubleshooting section

---

## Continuous Improvement

1. **Code Reviews**: Learn from feedback
2. **Performance Monitoring**: Regular performance audits
3. **Security Updates**: Keep dependencies updated
4. **User Feedback**: Incorporate user suggestions
5. **Refactoring**: Regular code cleanup and optimization

---

## Resources

- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember**: These guidelines are living documents. Update them as the project evolves and best practices change.
