# AI Lawyer App - Demo Login

## Demo Credentials

The app now includes built-in demo mode that works without a backend!

### How to Login:

1. **Automatic Method**: Click the "Use Demo Account" button on the sign-in page
2. **Manual Method**: Use these credentials:
   - Email: `demo@example.com`
   - Password: `demo123!`

### Features:
- No backend server required
- Instant login with mock authentication
- Full access to all app features with mock data
- Clear visual indication of demo mode on the login page

### Running the App:
```bash
cd /Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend
npm install (if needed)
npm run dev
```

Then navigate to http://localhost:3000 and use the demo credentials!

### Testing Demo Mode:
1. Visit http://localhost:3000/demo-test to test the demo login directly
2. Check browser console for any errors
3. Clear localStorage if you have issues: Open DevTools > Application > Storage > Local Storage > Clear All

### Implementation Details:
- Demo authentication bypasses API calls when using demo@example.com
- Mock tokens start with "mock-access-token-" prefix
- Session validation is skipped for demo tokens
- Demo user has role "tenant" to match the app's user types