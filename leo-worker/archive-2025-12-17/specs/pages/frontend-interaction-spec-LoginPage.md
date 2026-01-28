# Frontend Interaction Specification: LoginPage

**Route**: `/login`
**Layout**: Form Layout (centered card, 480px max width, no sidebar/footer)
**Purpose**: Allow users to authenticate with email and password to access their accounts.

---

## 1. Page Setup

- **Name**: LoginPage
- **Route**: `/login`
- **Layout**: Form Layout
  - Centered card on dark slate background (#0F172A)
  - Max width: 480px
  - White card background with rounded corners
  - Header with logo and app name
  - No sidebar, no footer
- **Access**: Public (unauthenticated users only)
- **Redirect Logic**: If user is already authenticated, redirect to UserDashboardPage at `/dashboard`

---

## 2. Content Structure

### Header Section (Top of Card)
- **Logo**: Timeless Weddings logo (centered, 48px height)
- **Heading**: "Welcome Back" (text-4xl, font-bold, slate-900, centered)
- **Subtitle**: "Sign in to manage your bookings and reservations" (text-base, slate-600, centered, margin-top: xs)

### Form Section (Main Content)
- **Email Input Field**
  - Label: "Email Address" (text-sm, font-medium, slate-700)
  - Placeholder: "you@example.com"
  - Type: email
  - Required: Yes
  - Validation: Valid email format
  - Error message: "Please enter a valid email address"

- **Password Input Field**
  - Label: "Password" (text-sm, font-medium, slate-700)
  - Placeholder: "Enter your password"
  - Type: password
  - Required: Yes
  - Validation: Minimum 8 characters
  - Error message: "Password must be at least 8 characters"
  - Show/Hide toggle button (eye icon, position: absolute right)

- **Forgot Password Link**
  - Text: "Forgot your password?" (text-sm, purple-600, hover:purple-700)
  - Position: Right-aligned below password field
  - Destination: ForgotPasswordPage at `/forgot-password`

- **Remember Me Checkbox** (Optional Feature)
  - Label: "Keep me signed in" (text-sm, slate-700)
  - Position: Left-aligned below password field
  - Default: Unchecked

### Action Buttons
- **Sign In Button**
  - Label: "Sign In" (centered in button)
  - Style: Primary button (purple-600 background, white text, full width)
  - Size: Large (48px height)
  - State: Disabled when form is invalid or submitting
  - Loading state: Shows spinner and text "Signing in..."

### Footer Section (Bottom of Card)
- **Divider**: Horizontal line with "OR" text centered (slate-300)
- **Sign Up Prompt**
  - Text: "Don't have an account?" (text-sm, slate-600)
  - Link: "Sign up" (text-sm, purple-600, hover:purple-700, font-semibold)
  - Destination: SignupPage at `/signup`

### Additional Links (Below Card)
- **Back to Home Link**
  - Text: "← Back to Home" (text-sm, slate-400, hover:slate-300)
  - Position: Centered below card
  - Destination: HomePage at `/`

---

## 3. User Interactions

### Interactive Elements Catalog

#### Email Input Field
- **Type**: Text input (email)
- **On Focus**: Border color changes to purple-500
- **On Blur**: Validate email format, show error if invalid
- **On Change**: Clear previous error message

#### Password Input Field
- **Type**: Password input
- **On Focus**: Border color changes to purple-500
- **On Blur**: Validate minimum length, show error if invalid
- **On Change**: Clear previous error message

#### Show/Hide Password Toggle
- **Element**: Button with eye icon
- **Position**: Absolute right inside password input
- **On Click**: Toggle password visibility (text/password type)
- **Icon Change**: Eye icon ↔ Eye-slash icon

#### Forgot Password Link
- **Element**: Text link
- **On Click**: Navigate to ForgotPasswordPage at `/forgot-password`
- **Visual**: Purple underline on hover

#### Sign In Button
- **Element**: Primary button
- **On Click**: Submit form and trigger login API call
- **Disabled State**: When form is invalid (empty fields, invalid email) or during submission
- **Loading State**: Shows spinner, text changes to "Signing in...", button disabled

#### Sign Up Link
- **Element**: Text link in footer
- **On Click**: Navigate to SignupPage at `/signup`
- **Visual**: Purple underline on hover

#### Back to Home Link
- **Element**: Text link below card
- **On Click**: Navigate to HomePage at `/`
- **Visual**: Slate color, no underline, hover changes opacity

---

## 4. API Integration

### On Form Submission

**Endpoint**: `apiClient.users.login()`

**Request**:
```typescript
const { data, error } = await apiClient.users.login({
  body: {
    email: formData.email,
    password: formData.password
  }
});
```

**Success Response** (200):
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: 'couple' | 'chapel_owner' | 'vendor' | 'admin';
    phone?: string;
    profileImageUrl?: string;
    isActive: boolean;
  },
  token: string
}
```

**Success Flow**:
1. Store token in localStorage: `localStorage.setItem('authToken', data.token)`
2. Set token in apiClient: `apiClient.setAuthToken(data.token)`
3. Store user data in app state (React Context/TanStack Query cache)
4. Show success toast: "Welcome back, [user.name]!"
5. Redirect based on user role:
   - `role === 'couple'` → UserDashboardPage at `/dashboard`
   - `role === 'chapel_owner'` → ChapelOwnerDashboardPage at `/chapel-owner/dashboard`
   - `role === 'admin'` → AdminDashboardPage at `/admin/dashboard`
   - `role === 'vendor'` → UserDashboardPage at `/dashboard` (default)

**Error Handling**:

- **401 Unauthorized** (Invalid credentials):
  - Show error message below form: "Invalid email or password. Please try again."
  - Clear password field
  - Keep email field populated
  - Focus on password field

- **403 Forbidden** (Account inactive):
  - Show error message: "Your account has been deactivated. Please contact support."
  - Disable submit button

- **429 Too Many Requests** (Rate limiting):
  - Show error message: "Too many login attempts. Please try again in 5 minutes."
  - Disable submit button for 5 minutes
  - Show countdown timer

- **500 Server Error**:
  - Show error message: "Unable to sign in. Please try again later."
  - Keep form populated
  - Enable retry

---

## 5. States

### Initial State
- **UI**: Empty form with email and password fields
- **Buttons**: Sign In button enabled (but validation prevents submission)
- **Messages**: No error or success messages visible

### Loading State (During API Call)
- **UI**:
  - Sign In button shows spinner icon and text "Signing in..."
  - Button disabled and opacity reduced to 70%
  - Email and password fields disabled (prevent changes)
- **Visual**: Small purple spinner icon next to button text

### Success State
- **UI**:
  - Success toast appears (top-right corner, green background, white text)
  - Toast message: "Welcome back, [user.name]!"
  - Toast auto-dismisses after 2 seconds
  - Page begins redirect to appropriate dashboard
- **Animation**: Smooth fade-out transition before redirect

### Error State
- **UI**:
  - Error message appears below Submit button (red-600 text, text-sm)
  - Error message background: light red (#FEE2E2)
  - Padding: sm, margin-top: sm
  - Icon: Red exclamation circle
- **Form State**:
  - Password field cleared (security best practice)
  - Email field retains value
  - Focus returns to password field
- **Button State**: Re-enabled for retry

### Validation Error State (Client-side)
- **Email Invalid**:
  - Red border on email input
  - Error message below field: "Please enter a valid email address"
- **Password Too Short**:
  - Red border on password input
  - Error message below field: "Password must be at least 8 characters"
- **Empty Fields**:
  - Submit button disabled
  - No error messages shown until user attempts submission

---

## 6. Form Fields (Detailed)

### Email Field
- **Schema Reference**: `UserSchema.email` (string, email format, required)
- **Label**: "Email Address"
- **Type**: email
- **Placeholder**: "you@example.com"
- **Autocomplete**: "email"
- **Required**: Yes
- **Validation**:
  - Must match email regex pattern
  - Must not be empty
- **Error Messages**:
  - Empty: "Email is required"
  - Invalid: "Please enter a valid email address"

### Password Field
- **Schema Reference**: User password (string, min 8 characters, required)
- **Label**: "Password"
- **Type**: password (toggleable to text)
- **Placeholder**: "Enter your password"
- **Autocomplete**: "current-password"
- **Required**: Yes
- **Validation**:
  - Minimum 8 characters
  - Must not be empty
- **Error Messages**:
  - Empty: "Password is required"
  - Too short: "Password must be at least 8 characters"
- **Show/Hide Toggle**: Eye icon button to reveal/hide password

---

## 7. Navigation Map

### From LoginPage, users can navigate to:

1. **SignupPage** (`/signup`)
   - Via "Sign up" link in footer
   - When user doesn't have an account

2. **ForgotPasswordPage** (`/forgot-password`)
   - Via "Forgot your password?" link
   - When user can't remember password

3. **HomePage** (`/`)
   - Via "Back to Home" link below card
   - Cancel/exit login flow

4. **UserDashboardPage** (`/dashboard`)
   - After successful login (role: 'couple')
   - Automatic redirect

5. **ChapelOwnerDashboardPage** (`/chapel-owner/dashboard`)
   - After successful login (role: 'chapel_owner')
   - Automatic redirect

6. **AdminDashboardPage** (`/admin/dashboard`)
   - After successful login (role: 'admin')
   - Automatic redirect

### Navigation triggered automatically:
- **On page load**: If user already authenticated → redirect to appropriate dashboard
- **On successful login**: Redirect to role-specific dashboard

---

## 8. Permissions & Access Control

### Access Rules
- **Who can access**: Unauthenticated users only
- **Redirect if authenticated**: Users already logged in are redirected to their dashboard
- **No role restrictions**: Page is public (anyone can attempt login)

### Post-Login Access
- **Couple role**: Access to UserDashboardPage, booking features, favorites
- **Chapel Owner role**: Access to ChapelOwnerDashboardPage, chapel management
- **Admin role**: Access to AdminDashboardPage, full platform management
- **Vendor role**: Access to UserDashboardPage (default/limited access)

---

## 9. Design Specifications (From Master)

### Colors
- **Background**: Dark slate (#0F172A)
- **Card Background**: White (#FFFFFF)
- **Primary Button**: Purple (#8B5CF6) with white text
- **Text Colors**:
  - Headings: Slate-900 (#0F172A)
  - Body: Slate-700 (#334155)
  - Subtle: Slate-600 (#475569)
  - Links: Purple-600 (#9333EA)
- **Error**: Red-600 (#DC2626)
- **Success**: Green-600 (#16A34A)

### Typography
- **Heading**: 36px (text-4xl), 700 weight, Inter font
- **Subtitle**: 16px (text-base), 400 weight
- **Labels**: 14px (text-sm), 500 weight
- **Inputs**: 16px (text-base), 400 weight
- **Button**: 16px (text-base), 600 weight
- **Links**: 14px (text-sm), 600 weight

### Spacing
- **Card Padding**: lg (24px)
- **Input Spacing**: md (16px) between fields
- **Section Spacing**: lg (24px) between sections
- **Button Height**: 48px (large)
- **Input Height**: 44px (medium)

### Components
- **Inputs**:
  - Border: 1px solid slate-300
  - Focus: 2px purple-500 border
  - Error: 2px red-500 border
  - Rounded: md (8px)
  - Padding: sm horizontal (12px)
- **Buttons**:
  - Primary: Purple-600 background, white text, rounded-md
  - Hover: Purple-700
  - Disabled: Opacity 50%, cursor not-allowed
- **Card**:
  - Background: White
  - Border: None
  - Shadow: Large shadow (0 10px 15px rgba(0,0,0,0.1))
  - Rounded: lg (12px)

---

## 10. Error Handling Details

### Client-Side Validation Errors
- **Empty Email**: "Email is required"
- **Invalid Email Format**: "Please enter a valid email address"
- **Empty Password**: "Password is required"
- **Short Password**: "Password must be at least 8 characters"

### Server-Side API Errors

#### 401 Unauthorized (Invalid Credentials)
```typescript
// Error Response
{
  statusCode: 401,
  message: "Invalid email or password"
}
```
- **UI**: Red error banner below submit button
- **Message**: "Invalid email or password. Please try again."
- **Action**: Clear password field, keep email, focus password

#### 403 Forbidden (Account Deactivated)
```typescript
{
  statusCode: 403,
  message: "Account is inactive"
}
```
- **UI**: Red error banner with info icon
- **Message**: "Your account has been deactivated. Please contact support at support@timelessweddings.com"
- **Action**: Disable submit button, show contact email

#### 429 Too Many Requests (Rate Limit)
```typescript
{
  statusCode: 429,
  message: "Too many login attempts",
  retryAfter: 300 // seconds
}
```
- **UI**: Orange warning banner with clock icon
- **Message**: "Too many login attempts. Please try again in 5 minutes."
- **Action**: Disable form for 5 minutes, show countdown timer

#### 500 Internal Server Error
```typescript
{
  statusCode: 500,
  message: "Internal server error"
}
```
- **UI**: Red error banner with retry button
- **Message**: "Unable to sign in. Please try again later."
- **Action**: Keep form enabled, allow retry, suggest contacting support

### Network Errors (No Response)
- **UI**: Red error banner with offline icon
- **Message**: "Network error. Please check your internet connection and try again."
- **Action**: Keep form populated, enable retry button

---

## 11. Responsive Design

### Mobile (< 640px)
- Card width: 100% with 16px margins on sides
- Heading: Reduce to text-3xl (30px)
- Input height: 44px (touch-friendly)
- Button height: 48px (touch-friendly)
- Spacing: Reduce to md (16px) between sections

### Tablet (640px - 1024px)
- Card width: 480px (centered)
- Standard spacing and typography
- Same interaction patterns as desktop

### Desktop (> 1024px)
- Card width: 480px (centered)
- Standard spacing and typography
- Hover states enabled for buttons and links

---

## 12. Accessibility

### Keyboard Navigation
- Tab order: Email → Password → Show/Hide Toggle → Forgot Password Link → Sign In Button → Sign Up Link → Back to Home Link
- Enter key on any field: Submit form (if valid)
- Escape key: Clear any error messages

### Screen Reader Support
- **Email Input**: `aria-label="Email Address"`, `aria-required="true"`, `aria-invalid="false"` (or true if error)
- **Password Input**: `aria-label="Password"`, `aria-required="true"`, `aria-invalid="false"`
- **Error Messages**: `role="alert"`, `aria-live="polite"`
- **Submit Button**: `aria-label="Sign in to your account"`, `aria-busy="true"` during loading
- **Form**: `role="form"`, `aria-labelledby="login-heading"`

### Focus Management
- Visible focus rings on all interactive elements (purple-500, 2px offset)
- Auto-focus on email field when page loads
- Focus on password field after email validation error
- Focus on error message after API error

---

## 13. Performance Considerations

### Optimizations
- **Debounce Validation**: Wait 300ms after user stops typing before validating
- **Lazy Load Icons**: Load eye/eye-slash icons only when needed
- **Minimal Bundle Size**: Use only necessary form validation library
- **Fast Initial Load**: No heavy dependencies on login page

### Security
- **HTTPS Only**: All authentication happens over HTTPS
- **Token Storage**: Store JWT token securely in localStorage (consider httpOnly cookies in future)
- **Password Field**: Use type="password" to prevent shoulder surfing
- **Rate Limiting**: Enforce on backend, show friendly message on frontend
- **No Password Autofill on Error**: Clear password field after failed attempt

---

## 14. Implementation Notes

### React Component Structure
```typescript
// LoginPage.tsx
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TanStack Query mutation for login
  const loginMutation = useMutation({
    mutationFn: (credentials) => apiClient.users.login({ body: credentials }),
    onSuccess: (data) => {
      // Store token, redirect
    },
    onError: (error) => {
      // Handle error states
    }
  });

  // Render form
}
```

### Form Libraries
- **Validation**: Use Zod (already in schema) or React Hook Form
- **State Management**: TanStack Query for API state, React useState for form state
- **Toast Notifications**: Use shadcn/ui Toast component

### Testing Checklist
- [ ] Login with valid credentials redirects to correct dashboard
- [ ] Login with invalid credentials shows error message
- [ ] Email validation catches invalid formats
- [ ] Password validation enforces minimum length
- [ ] Show/hide password toggle works correctly
- [ ] Forgot password link navigates correctly
- [ ] Sign up link navigates correctly
- [ ] Back to home link navigates correctly
- [ ] Already authenticated users are redirected
- [ ] Error states display correctly (401, 403, 429, 500)
- [ ] Loading state shows during API call
- [ ] Success toast appears after successful login
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces errors and states
- [ ] Mobile responsive layout works
- [ ] Rate limiting prevents brute force attempts

---

## 15. References to Master Spec

### Layouts Used
- **Form Layout** (Section 3.3 of Master Spec)

### Components Used
- **Input Component** (Section 5.3 of Master Spec)
- **Button - Primary Style** (Section 5.1 of Master Spec)
- **Card Component** (Section 5.7 of Master Spec)
- **Link Component** (Typography variant)

### API Methods Used
- **`apiClient.users.login()`** (Section 4.5 of Master Spec, users namespace)

### Navigation Destinations
- All routes verified against Complete Page List (Section 8 of Master Spec)

### Design Tokens
- Colors from Section 2.1
- Typography from Section 2.2
- Spacing from Section 2.3

---

**End of LoginPage Specification**
