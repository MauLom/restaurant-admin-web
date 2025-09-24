# Restaurant Admin Web Application

Restaurant Admin Web is a React-based frontend application for managing restaurant operations including orders, inventory, analytics, and staff management. It features role-based access control and a complete demo mode with sample data.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Technologies Used

- **React 18** - JavaScript framework with hooks and context
- **Chakra UI** - Component and layout library for consistent styling
- **Axios** - REST API client with demo mode interceptors
- **React Router** - Navigation and routing
- **Day.js** - Lightweight date manipulation
- **Jest & React Testing Library** - Unit and integration testing
- **React Scripts** - Build tooling via Create React App

## Working Effectively

### Bootstrap and Setup Commands
```bash
# Install dependencies - NEVER CANCEL, takes ~3 minutes
npm install
# Timeout: Set to 300+ seconds. Wait for completion.

# Add required babel plugin for Jest compatibility
npm install --save-dev @babel/plugin-proposal-private-property-in-object
```

### Build Commands
```bash
# Development build and server - compiles in ~25 seconds
npm start
# Application runs at http://localhost:3000
# NEVER CANCEL: Wait for "webpack compiled successfully" message

# Production build - NEVER CANCEL, takes ~20 seconds
npm run build
# Timeout: Set to 180+ seconds. Creates optimized build in /build directory
# Build succeeds with ESLint warnings resolved
```

### Testing Commands
```bash
# Run tests - takes ~4 seconds but will show failing tests due to context requirements
npm test -- --watchAll=false
# Timeout: Set to 120+ seconds
# Tests fail due to missing React context providers in test setup
# This is expected behavior - application requires DemoProvider context
```

## Development Environment

### Environment Variables
Create `.env` file in repository root:
```env
REACT_APP_API_URL=http://localhost:5000/api
JWT_SECRET=your_jwt_secret_here
```

### Demo Mode
- Application includes comprehensive demo mode with sample data
- Demo users: admin-demo (PIN: 123456), mesero-demo (PIN: 111111), cajero-demo (PIN: 222222)
- Demo mode accessible via "🎭 Acceder al Demo" button on login screen
- All demo data stored in localStorage, no backend required

## Key Project Structure

```
src/
├── features/           # Feature-based organization
│   ├── orders/        # Order management (waiters, kitchen)
│   ├── analytics/     # Sales and performance analytics
│   ├── inventory/     # Stock and inventory management
│   ├── auth/          # Authentication and user management
│   └── restaurantLayoutManagement/  # Table and section management
├── components/        # Reusable UI components
├── context/          # React contexts (DemoContext, AuthContext)
├── services/         # API client and service layer
│   └── api.js        # Centralized Axios instance with demo interceptors
├── utils/            # Utility functions and demo data
│   ├── demoData.js   # Sample data for demo mode
│   └── demoApi.js    # Demo API response handlers
├── theme/            # Chakra UI theme customization
├── hooks/            # Custom React hooks
└── layout/           # Page layouts and navigation
```

## Known Issues and Workarounds

### Build Issues
- **ESLint warnings treated as errors**: Fixed by removing unused imports and using proper export syntax
- **Babel deprecated plugin warnings**: Install `@babel/plugin-proposal-private-property-in-object` as dev dependency

### Test Issues
- **Jest/Axios ES module conflict**: Resolved with `transformIgnorePatterns` in package.json
- **Test failures due to missing context**: Expected behavior, tests need DemoProvider wrapper
- **"learn react" test**: Default CRA test that fails due to application architecture

### Runtime Issues
- **Table selection errors**: Some table management features may show console errors in development
- **API errors in demo mode**: Expected behavior when backend is not running, demo mode handles this gracefully

## Validation Scenarios

### Critical User Workflows to Test
1. **Login Flow**: 
   - Test PIN entry with demo accounts
   - Verify demo mode activation with sample data
   - Confirm navigation to dashboard

2. **Demo Mode Functionality**:
   - Access demo mode via login screen
   - Navigate through different sections (orders, analytics, inventory)
   - Verify sample data displays correctly
   - Test role-based navigation (admin vs waiter vs cashier views)

3. **Development Server**:
   - Confirm application starts at http://localhost:3000
   - Verify hot reloading works during development
   - Check console for any critical errors (warnings are expected)

### Validation Commands
```bash
# Always run these after making changes:
npm run build    # Verify production build succeeds
npm start       # Verify development server starts
# Navigate to http://localhost:3000 and test demo login

# Check for critical console errors (warnings about deprecated packages are expected)
# Verify application renders and demo mode is accessible
```

## Common Development Tasks

### Adding New Features
- Follow feature-based organization under `src/features/`
- Use existing hooks and contexts for state management
- Leverage demo data patterns for development and testing
- Always test in demo mode before backend integration

### Styling and Components
- Use Chakra UI components and theme system
- Custom theme defined in `src/theme/`
- Color scheme: dark theme with teal primary and orange secondary
- Responsive design patterns already established

### API Integration
- Centralized in `src/services/api.js`
- Demo mode automatically intercepts API calls
- Add new endpoints following existing patterns
- Test with demo data before real API integration

## Build and Deployment

### Production Build
```bash
npm run build
# NEVER CANCEL: Build takes ~20 seconds, set 180+ second timeout
# Output in /build directory (excluded from git)
# Serves static files, deployable to any static hosting
```

### Development Workflow
```bash
npm start    # Start development server
# NEVER CANCEL: Initial compilation takes ~25 seconds
# Hot reloading enabled for rapid development
# Application available at http://localhost:3000
```

## Important Notes

- **NEVER CANCEL LONG-RUNNING COMMANDS**: npm install (3 min), npm start (25 sec), npm run build (20 sec)
- **Demo mode is fully functional**: No backend required for development and testing
- **Build artifacts excluded**: /build directory is gitignored, do not commit build files
- **ESLint configuration**: Extends react-app with additional rules, warnings resolved
- **Jest configuration**: Includes transformIgnorePatterns for Axios compatibility
- **Test failures expected**: Application architecture requires context providers for tests

## Quick Start for New Developers

```bash
# 1. Fresh setup (5 minutes total)
npm install  # Wait 3 minutes - NEVER CANCEL
npm install --save-dev @babel/plugin-proposal-private-property-in-object

# 2. Verify build works
npm run build  # Wait 20 seconds - NEVER CANCEL

# 3. Start development
npm start  # Wait 25 seconds - NEVER CANCEL

# 4. Test application
# Navigate to http://localhost:3000
# Click "🎭 Acceder al Demo"
# Explore admin dashboard with sample data
```

The application is fully functional in demo mode and ready for development without any backend dependencies.