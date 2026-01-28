# Frontend Interaction Specification: ContactPage

**Route**: `/contact`
**Layout**: Form Layout (from master spec)
**Purpose**: Allow users to send inquiries or support requests to the Timeless Weddings team

---

## 1. Page Setup

- **Name**: ContactPage
- **Route**: `/contact` (public route)
- **Layout**: Form Layout
  - Header with navigation
  - Centered card container (max-width: 640px)
  - Footer with links
- **Access**: Public (no authentication required)

---

## 2. Content Structure

### Hero Section
- **Heading**: "Get in Touch" (text-4xl, font-bold, text-slate-100)
- **Subtitle**: "Have questions? We're here to help. Send us a message and we'll respond within 24 hours." (text-lg, text-slate-400)
- **Spacing**: 48px margin below hero

### Contact Information Cards (Grid: 3 columns on desktop, 1 on mobile)

**Card 1: Email**
- Icon: Mail icon (purple)
- Label: "Email Us" (text-lg, font-semibold, text-slate-100)
- Value: "support@timelessweddings.com" (text-slate-400, clickable mailto link)

**Card 2: Phone**
- Icon: Phone icon (purple)
- Label: "Call Us" (text-lg, font-semibold, text-slate-100)
- Value: "(555) 123-4567" (text-slate-400, clickable tel link)

**Card 3: Hours**
- Icon: Clock icon (purple)
- Label: "Business Hours" (text-lg, font-semibold, text-slate-100)
- Value: "Mon-Fri: 9AM-6PM EST" (text-slate-400)

**Spacing**: 48px margin below cards

### Contact Form Section

**Card Container**:
- Background: Dark slate (#1E293B)
- Border: 1px solid slate-700
- Border radius: 12px
- Padding: 32px

**Form Fields** (stacked vertically, 24px spacing):

1. **Name Field** (required)
   - Label: "Your Name" (text-sm, font-medium, text-slate-300)
   - Input: Text input, full width
   - Placeholder: "John Doe"
   - Validation: Required, min 2 characters

2. **Email Field** (required)
   - Label: "Email Address" (text-sm, font-medium, text-slate-300)
   - Input: Email input, full width
   - Placeholder: "john@example.com"
   - Validation: Required, valid email format

3. **Phone Field** (optional)
   - Label: "Phone Number" (text-sm, font-medium, text-slate-300)
   - Input: Tel input, full width
   - Placeholder: "(555) 123-4567"
   - Validation: Optional, valid phone format if provided

4. **Subject Field** (required)
   - Label: "Subject" (text-sm, font-medium, text-slate-300)
   - Input: Select dropdown, full width
   - Options:
     - "General Inquiry"
     - "Vendor Partnership"
     - "Technical Support"
     - "Feedback"
     - "Other"
   - Validation: Required

5. **Message Field** (required)
   - Label: "Message" (text-sm, font-medium, text-slate-300)
   - Input: Textarea, full width, 6 rows
   - Placeholder: "Tell us how we can help..."
   - Validation: Required, min 10 characters, max 1000 characters
   - Character counter: "0 / 1000" (text-xs, text-slate-500, bottom-right)

**Form Actions**:
- **Submit Button**: "Send Message" (primary button, full width on mobile, auto-width on desktop)
  - Background: Purple (#8B5CF6)
  - Text: White
  - Hover: Darker purple (#7C3AED)
  - Loading state: Shows spinner + "Sending..."
  - Disabled when form is invalid or submitting

---

## 3. User Interactions

### Header Navigation (from master spec)
- **Logo**: Navigates to HomePage (`/`)
- **"Find Vendors" link**: Navigates to VendorsSearchPage (`/vendors`)
- **"Browse Portfolios" link**: Navigates to PortfoliosBrowsePage (`/portfolios/browse`)
- **"Contact" link**: Current page (highlighted with purple underline)
- **"Login" button** (if not authenticated): Navigates to LoginPage (`/login`)
- **"Sign Up" button** (if not authenticated): Navigates to SignupPage (`/signup`)
- **User avatar dropdown** (if authenticated):
  - "Dashboard" → CoupleDashboardPage (`/couple/dashboard`) or VendorDashboardPage (`/vendor/dashboard`)
  - "Profile" → ProfilePage (`/profile`)
  - "Settings" → SettingsPage (`/settings`)
  - "Logout" → Triggers logout, navigates to HomePage (`/`)

### Footer Links (from master spec)
- **Company Section**:
  - "About" → AboutPage (`/about`)
  - "Contact" → ContactPage (`/contact`) - current page
  - "Terms" → TermsPage (`/terms`)
  - "Privacy" → PrivacyPage (`/privacy`)
- **For Couples Section**:
  - "Find Vendors" → VendorsSearchPage (`/vendors`)
  - "Browse Services" → ServicesBrowsePage (`/services/browse`)
  - "View Portfolios" → PortfoliosBrowsePage (`/portfolios/browse`)
- **For Vendors Section**:
  - "Become a Vendor" → SignupPage with role=vendor (`/signup?role=vendor`)
  - "Vendor Dashboard" → VendorDashboardPage (`/vendor/dashboard`)

### Contact Information Interactions
- **Email link**: Opens default email client with `mailto:support@timelessweddings.com`
- **Phone link**: Opens phone dialer with `tel:+15551234567`

### Form Interactions

**Field Validation** (real-time):
- Show error messages below fields when user leaves field (onBlur)
- Error message styling: text-sm, text-red-400
- Input border changes to red-500 on error, purple-500 on focus

**Submit Button**:
- **Action**: Submit contact form
- **Trigger**: Click or Enter key when button is focused
- **Behavior**:
  1. Validate all fields client-side
  2. If invalid, show error messages, scroll to first error
  3. If valid, show loading state, disable form
  4. **Future: Backend endpoint needed** - No messaging API method exists for public contact form
     - Would need: `apiClient.contact.sendInquiry(body: { name, email, phone?, subject, message })`
  5. On success: Show success toast, clear form
  6. On error: Show error toast, re-enable form

**Character Counter** (Message field):
- Updates in real-time as user types
- Changes color:
  - Gray (text-slate-500) when under 900 characters
  - Orange (text-orange-400) when 900-1000 characters
  - Red (text-red-400) when at 1000 characters

---

## 4. API Integration

### Current State: NO API NEEDED (Future Enhancement)

This page does NOT currently use any API methods because:
- The API Registry does not include a public contact/inquiry endpoint
- The `messages` namespace requires authentication and is for user-to-user messaging
- This is a public contact form for general inquiries

### Future Enhancement Required

When backend support is added, implement:

```typescript
// On form submit (after validation passes)
try {
  setIsSubmitting(true);

  // FUTURE: Backend endpoint needed
  // This method does not exist in API Registry
  const response = await apiClient.contact.sendInquiry({
    body: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone, // optional
      subject: formData.subject,
      message: formData.message
    }
  });

  // Success handling
  toast.success('Message sent! We\'ll respond within 24 hours.');
  resetForm();

} catch (error) {
  console.error('Failed to send message:', error);
  toast.error('Failed to send message. Please try again or email us directly.');
} finally {
  setIsSubmitting(false);
}
```

### Temporary Solution (Until API Exists)

**Option 1**: Client-side only with mailto
- Submit button opens email client with pre-filled message:
```typescript
const mailtoLink = `mailto:support@timelessweddings.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`)}`;
window.location.href = mailtoLink;
```

**Option 2**: Third-party service integration
- Use FormSpree, Netlify Forms, or similar service
- Does not require backend changes

---

## 5. States

### Loading State
**Not applicable** - Page loads immediately with static content and form

### Empty State
**Not applicable** - Form is always visible and interactive

### Success State (After Form Submission)
- **Toast Notification**: Appears at top-right
  - Background: Green (#10B981)
  - Icon: Checkmark
  - Message: "Message sent successfully! We'll respond within 24 hours."
  - Duration: 5 seconds
- **Form Behavior**: All fields cleared, ready for another submission
- **Focus**: Returns to Name field

### Error State (Form Submission Failed)
- **Toast Notification**: Appears at top-right
  - Background: Red (#EF4444)
  - Icon: X mark
  - Message: "Failed to send message. Please try again or email us directly at support@timelessweddings.com"
  - Duration: 7 seconds
- **Form Behavior**: Remains populated, re-enabled for retry
- **Alternative Action**: Email link in error message is clickable (mailto link)

### Validation Error State (Client-side)
- **Individual Field Errors**: Show below each invalid field
  - Name: "Name must be at least 2 characters"
  - Email: "Please enter a valid email address"
  - Phone: "Please enter a valid phone number" (if provided)
  - Subject: "Please select a subject"
  - Message: "Message must be between 10 and 1000 characters"
- **Submit Button**: Disabled until all validations pass
- **Visual Feedback**: Invalid fields have red border (border-red-500)

---

## 6. Form Validation Rules

### Client-Side Validation (Zod Schema)

```typescript
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(/^[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  subject: z.enum([
    'General Inquiry',
    'Vendor Partnership',
    'Technical Support',
    'Feedback',
    'Other'
  ]),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
});
```

### Validation Timing
- **On Blur**: Validate individual field when user leaves it
- **On Change**: Re-validate field if it previously had an error
- **On Submit**: Validate entire form before submission

---

## 7. Responsive Behavior

### Mobile (< 768px)
- Contact cards: Stack vertically (1 column)
- Form: Full width with 16px padding
- Submit button: Full width
- Character counter: Positioned below textarea (not floating)

### Tablet (768px - 1024px)
- Contact cards: 3 columns (maintained)
- Form: Max-width 640px, centered
- Submit button: Full width within card

### Desktop (> 1024px)
- Contact cards: 3 columns with more spacing
- Form: Max-width 640px, centered
- Submit button: Auto-width, right-aligned within card

---

## 8. Accessibility

- **Labels**: All form fields have visible labels with proper `for` attributes
- **Required Fields**: Indicated with asterisk (*) in label
- **ARIA Labels**:
  - Contact information cards have `aria-label` attributes
  - Form has `aria-label="Contact form"`
  - Submit button has `aria-busy="true"` when submitting
- **Keyboard Navigation**:
  - Tab order: Name → Email → Phone → Subject → Message → Submit
  - Enter key submits form when button is focused
  - Escape key clears form (with confirmation)
- **Error Announcements**: Error messages have `role="alert"` for screen readers
- **Focus Management**: After submission, focus returns to first field or announcement

---

## 9. Visual Design Details

### Colors (from master spec)
- **Background**: Dark slate #0F172A (page), #1E293B (card)
- **Text**: Slate-100 (headings), Slate-400 (body), Slate-300 (labels)
- **Accent**: Purple #8B5CF6 (icons, buttons, focus states)
- **Borders**: Slate-700 (card borders, input borders)
- **Error**: Red-400 (validation errors)
- **Success**: Green (success toast background)

### Typography (from master spec)
- **Font Family**: Inter
- **Hero Heading**: 36px, bold (text-4xl, font-bold)
- **Subtitle**: 18px, regular (text-lg)
- **Card Labels**: 18px, semibold (text-lg, font-semibold)
- **Form Labels**: 14px, medium (text-sm, font-medium)
- **Input Text**: 16px, regular
- **Character Counter**: 12px (text-xs)

### Spacing (from master spec)
- **Section gaps**: 48px
- **Form field gaps**: 24px
- **Card padding**: 32px
- **Input padding**: 12px (vertical), 16px (horizontal)

### Interactive States
- **Hover** (links/buttons): Opacity 80% or color change
- **Focus** (inputs): Purple border (#8B5CF6), purple ring shadow
- **Active** (buttons): Darker purple (#7C3AED)
- **Disabled**: Opacity 50%, cursor not-allowed

---

## 10. Related Pages

### Navigation From This Page
- **HomePage** (`/`): Via logo in header
- **AboutPage** (`/about`): Via footer link
- **TermsPage** (`/terms`): Via footer link
- **PrivacyPage** (`/privacy`): Via footer link
- **LoginPage** (`/login`): Via header button (if not authenticated)
- **SignupPage** (`/signup`): Via header button or footer link
- **VendorsSearchPage** (`/vendors`): Via header link
- **PortfoliosBrowsePage** (`/portfolios/browse`): Via header link
- **Dashboard Pages**: Via user dropdown (if authenticated)

### Navigation To This Page
- **HomePage**: "Contact Us" link in hero or footer
- **AboutPage**: "Get in touch" CTA
- **Footer**: "Contact" link (all pages)
- **Error states**: "Contact support" links in error messages

---

## 11. Technical Implementation Notes

### Component Structure
```
ContactPage
├── PageContainer (Form Layout)
├── HeroSection
│   ├── Heading
│   └── Subtitle
├── ContactCardsGrid
│   ├── EmailCard
│   ├── PhoneCard
│   └── HoursCard
└── ContactFormSection
    └── FormCard
        ├── NameField (required)
        ├── EmailField (required)
        ├── PhoneField (optional)
        ├── SubjectField (required)
        ├── MessageField (required, with counter)
        └── SubmitButton
```

### State Management
```typescript
interface ContactFormState {
  formData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  touched: Record<string, boolean>;
}
```

### Form Submission Flow
1. User fills out form fields
2. Real-time validation on blur/change
3. User clicks "Send Message"
4. Client-side validation (all fields)
5. Show loading state (disable form, show spinner)
6. **FUTURE**: Send to backend API (when available)
7. Show success/error toast
8. Reset form on success, keep data on error

---

## 12. Future Enhancements

### When Backend API is Available
1. Implement `apiClient.contact.sendInquiry()` method
2. Store inquiries in database with status tracking
3. Email notifications to support team
4. Auto-reply email to user confirming receipt
5. Admin panel to manage inquiries

### Additional Features
1. **File Attachments**: Allow users to upload screenshots/documents
2. **Live Chat**: Integrate chat widget for instant support
3. **FAQ Section**: Add expandable FAQ before contact form
4. **Captcha**: Add reCAPTCHA to prevent spam (if needed)
5. **Department Routing**: Route inquiries to specific teams based on subject
6. **Response Time Estimate**: Show expected response time based on current queue

---

## Summary

The ContactPage provides a simple, accessible way for users to reach the Timeless Weddings team. It uses the Form Layout from the master spec with a centered card design. The page is fully public (no authentication required) and features:

- **Clear contact information** (email, phone, hours) with clickable links
- **Comprehensive contact form** with 5 fields and full validation
- **Real-time feedback** for validation errors and character limits
- **Success/error handling** with toast notifications
- **Full accessibility** support with ARIA labels and keyboard navigation
- **Responsive design** that works on mobile, tablet, and desktop

**Critical Note**: The page currently cannot submit to a backend API because no public contact/inquiry endpoint exists in the API Registry. A temporary mailto solution or third-party form service should be used until the backend endpoint is implemented.

All navigation links point to valid routes from the complete page list. The design follows the master spec's simple dark theme with purple accents and clean typography.
