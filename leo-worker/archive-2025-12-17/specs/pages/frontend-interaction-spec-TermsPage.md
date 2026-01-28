# Frontend Interaction Spec: TermsPage

## 1. Page Setup

**Name**: TermsPage
**Route**: `/terms`
**Layout**: Standard Layout (Header + Main + Footer)
**Purpose**: Display the platform's Terms of Service and legal agreements for users and vendors.

---

## 2. Content Structure

### Header Section
- **Component**: Standard header from master spec
- **Visibility**: All users (authenticated and unauthenticated)
- **Elements**: Logo, main navigation links, user dropdown (if authenticated)

### Hero Section
- **Background**: Dark slate (#1E293B)
- **Heading**: "Terms of Service" (text-4xl font-bold text-white)
- **Subtitle**: "Last updated: January 2025" (text-lg text-slate-400)
- **Container**: Max width 800px, centered

### Table of Contents Section
- **Background**: Slightly lighter slate (#1E293B)
- **Container**: Max width 800px, centered, padding 24px
- **Heading**: "Quick Navigation" (text-xl font-semibold text-white mb-4)
- **List of Links**:
  - Acceptance of Terms
  - User Accounts
  - Vendor Services
  - Payments and Fees
  - User Conduct
  - Intellectual Property
  - Privacy and Data
  - Dispute Resolution
  - Limitation of Liability
  - Termination
  - Changes to Terms
  - Contact Information

### Terms Content Section
- **Background**: Dark slate (#0F172A)
- **Container**: Max width 800px, centered, padding 32px vertical
- **Structure**: 12 sections, each with:
  - Section number and heading (text-2xl font-bold text-white mb-4)
  - Paragraphs (text-base text-slate-300 leading-relaxed mb-4)
  - Subsections where applicable (text-lg font-semibold text-white mb-2)
  - Bullet points for lists (text-slate-300)

#### Section 1: Acceptance of Terms
- Paragraph explaining that by using the service, users agree to terms
- Effective date of agreement
- Requirement to be 18+ or have guardian permission

#### Section 2: User Accounts
- Registration requirements (accurate information)
- Account security responsibilities
- Prohibition on sharing accounts
- Right to suspend/terminate accounts

#### Section 3: Vendor Services
- Vendor verification process
- Service listing requirements and accuracy
- Vendor responsibilities to couples
- Commission/fee structure overview
- Independent contractor status

#### Section 4: Payments and Fees
- Platform fees for vendors (if applicable)
- Payment processing through third parties
- Refund policies
- Dispute resolution for payments

#### Section 5: User Conduct
**Prohibited activities include:**
- Harassment or abusive behavior
- False or misleading information
- Spam or unsolicited messages
- Copyright infringement
- Illegal activities
- Attempting to bypass platform features

#### Section 6: Intellectual Property
- Platform owns all site content and code
- User-generated content license grant
- Vendor portfolio content ownership
- Restrictions on reproducing platform content
- DMCA compliance procedures

#### Section 7: Privacy and Data
- Reference to Privacy Policy at `/privacy`
- Data collection and usage summary
- User rights regarding their data
- Link text: "Read our full Privacy Policy" (purple link)

#### Section 8: Dispute Resolution
- Direct communication first
- Platform mediation services
- Arbitration agreement for legal disputes
- Jurisdiction and governing law
- Class action waiver

#### Section 9: Limitation of Liability
- Platform acts as marketplace only
- No guarantee of vendor service quality
- No liability for vendor-couple disputes
- Limitation of damages
- Indemnification by users

#### Section 10: Termination
- User's right to close account
- Platform's right to terminate accounts
- Effect of termination on data
- Survival of certain provisions

#### Section 11: Changes to Terms
- Right to modify terms at any time
- Notification process for changes
- Continued use equals acceptance
- Effective date of new terms

#### Section 12: Contact Information
- Contact email for legal questions
- Mailing address for formal notices
- Links to support resources

### Footer Section
- **Component**: Standard footer from master spec
- **Links**: About, Contact, Terms, Privacy, social media
- **Copyright**: "© 2025 Timeless Weddings. All rights reserved."

---

## 3. User Interactions

### Navigation Bar (Header)
1. **Logo/Brand Link**
   - **Label**: "Timeless Weddings" logo
   - **Position**: Top left of header
   - **Action**: Navigate to HomePage (`/`)

2. **About Link**
   - **Label**: "About"
   - **Position**: Header navigation
   - **Action**: Navigate to AboutPage (`/about`)

3. **Browse Vendors Link**
   - **Label**: "Browse Vendors"
   - **Position**: Header navigation
   - **Action**: Navigate to VendorsSearchPage (`/vendors/search`)

4. **Contact Link**
   - **Label**: "Contact"
   - **Position**: Header navigation
   - **Action**: Navigate to ContactPage (`/contact`)

5. **Login Button** (if not authenticated)
   - **Label**: "Login"
   - **Position**: Top right of header
   - **Style**: Outline button (border-purple-600)
   - **Action**: Navigate to LoginPage (`/login`)

6. **Signup Button** (if not authenticated)
   - **Label**: "Sign Up"
   - **Position**: Top right of header, next to Login
   - **Style**: Primary button (bg-purple-600)
   - **Action**: Navigate to SignupPage (`/signup`)

7. **User Dropdown Menu** (if authenticated)
   - **Trigger**: User avatar/name
   - **Position**: Top right of header
   - **Menu Items**:
     - **For Couples**:
       - "Dashboard" → CoupleDashboardPage (`/couple/dashboard`)
       - "Profile" → ProfilePage (`/profile`)
       - "Settings" → SettingsPage (`/settings`)
       - "Logout" → Logout action
     - **For Vendors**:
       - "Dashboard" → VendorDashboardPage (`/vendor/dashboard`)
       - "My Profile" → VendorProfilePage (`/vendor/profile`)
       - "Settings" → SettingsPage (`/settings`)
       - "Logout" → Logout action

### Table of Contents Links
8-19. **Section Anchor Links**
   - **Labels**: Section titles (e.g., "Acceptance of Terms")
   - **Position**: Table of contents box
   - **Style**: Purple links (text-purple-400 hover:text-purple-300)
   - **Action**: Smooth scroll to corresponding section on same page
   - **Implementation**: Use anchor tags with `href="#section-name"`

### In-Content Links
20. **Privacy Policy Link**
   - **Label**: "Read our full Privacy Policy"
   - **Position**: Within Section 7 (Privacy and Data)
   - **Style**: Purple link (text-purple-400 hover:underline)
   - **Action**: Navigate to PrivacyPage (`/privacy`)

21. **Contact Email Link**
   - **Label**: "legal@timelessweddings.com" (example)
   - **Position**: Within Section 12 (Contact Information)
   - **Style**: Purple link (text-purple-400 hover:underline)
   - **Action**: Open email client (`mailto:legal@timelessweddings.com`)

### Footer Links
22. **About Footer Link**
   - **Label**: "About"
   - **Position**: Footer navigation
   - **Action**: Navigate to AboutPage (`/about`)

23. **Contact Footer Link**
   - **Label**: "Contact"
   - **Position**: Footer navigation
   - **Action**: Navigate to ContactPage (`/contact`)

24. **Terms Footer Link**
   - **Label**: "Terms"
   - **Position**: Footer navigation
   - **Style**: Highlighted/active state (current page)
   - **Action**: Stay on TermsPage (no navigation)

25. **Privacy Footer Link**
   - **Label**: "Privacy"
   - **Position**: Footer navigation
   - **Action**: Navigate to PrivacyPage (`/privacy`)

26. **Social Media Links** (if applicable)
   - **Position**: Footer
   - **Action**: Open social media profiles in new tab

---

## 4. API Integration

**No API calls required for this page.**

This is a static content page displaying legal terms. All content is hardcoded or loaded from static markdown/text files.

### Future Enhancement (Optional)
If terms need to be managed dynamically:

```typescript
// On page load - fetch latest terms version
const { data: termsData } = await apiClient.content.getTerms();
// Note: This endpoint doesn't exist in current API Registry
// Would need to be added to backend first
```

---

## 5. States

### Default State (Success)
- Display full terms content
- All sections visible and readable
- Table of contents functional
- Smooth scrolling to sections works

### Loading State
**Not applicable** - Static content loads immediately.

If dynamic content is added in future:
- Show skeleton loader with:
  - Gray placeholder boxes for heading
  - Gray placeholder lines for paragraphs
  - Located in main content area

### Error State
**Not applicable** - No API calls means no errors.

If dynamic content is added in future:
- Display error message: "Unable to load Terms of Service"
- Show contact information: "Please contact us at legal@timelessweddings.com"
- Style: Red border card with error icon

### Empty State
**Not applicable** - Content is always present.

### Print/PDF State (Optional Enhancement)
- Add "Print/Download PDF" button at top
- Clean print stylesheet:
  - Remove navigation and footer
  - Black text on white background
  - Include page numbers
  - Include effective date on each page

---

## 6. Form Fields

**No forms on this page.**

---

## 7. Permissions & Access Control

### Access Level
- **Public page** - No authentication required
- Accessible to all visitors (unauthenticated users, couples, vendors, admins)

### Visibility Rules
- No content restrictions based on user role
- All users see identical content
- No permission checks needed

### SEO Considerations
- Page should be indexed by search engines
- Include meta description: "Terms of Service for Timeless Weddings platform. Review our legal agreements, user responsibilities, and platform policies."
- Canonical URL: `https://timelessweddings.com/terms`

---

## 8. Responsive Behavior

### Mobile (< 768px)
- Stack navigation items vertically in hamburger menu
- Reduce heading sizes:
  - Hero heading: text-3xl instead of text-4xl
  - Section headings: text-xl instead of text-2xl
- Table of contents collapses into expandable accordion
- Reduce container padding to 16px
- Font size: text-sm for body content

### Tablet (768px - 1024px)
- Standard header with horizontal navigation
- Content container: 90% width, max 800px
- Table of contents visible as sidebar or top section
- Font size: text-base for body content

### Desktop (> 1024px)
- Full layout with all navigation visible
- Content container: 800px centered
- Table of contents sticky on scroll (optional)
- Font size: text-base for body content

---

## 9. Accessibility

### Keyboard Navigation
- All anchor links in table of contents are keyboard accessible
- Smooth scroll behavior doesn't break keyboard navigation
- Skip link at top: "Skip to main content"

### Screen Readers
- Proper heading hierarchy (h1 → h2 → h3)
- Section landmarks: `<main>`, `<nav>`, `<footer>`
- Descriptive link text (avoid "click here")
- Alt text for any icons or images

### Visual Accessibility
- Sufficient contrast ratios:
  - White text on dark slate: 12:1+ ratio
  - Purple links on dark slate: 4.5:1+ ratio
- Text is resizable up to 200% without breaking layout
- Focus indicators visible on all interactive elements

---

## 10. Content Structure Details

### Typography Hierarchy
- **H1 (Hero)**: text-4xl (36px), font-bold, text-white
- **H2 (Sections)**: text-2xl (24px), font-bold, text-white, mb-4
- **H3 (Subsections)**: text-lg (18px), font-semibold, text-white, mb-2
- **Body**: text-base (16px), text-slate-300, leading-relaxed, mb-4
- **Small text**: text-sm (14px), text-slate-400 (for dates, notes)

### Spacing
- Section padding: 64px vertical on desktop, 32px on mobile
- Paragraph spacing: 16px bottom margin
- Section spacing: 48px between major sections
- Container padding: 32px horizontal on desktop, 16px on mobile

### Colors (from Master Spec)
- **Background**: #0F172A (dark slate)
- **Lighter background**: #1E293B (for TOC box)
- **Text**: white (#FFFFFF) for headings
- **Body text**: #CBD5E1 (slate-300)
- **Muted text**: #94A3B8 (slate-400)
- **Links**: #8B5CF6 (purple-600)
- **Link hover**: #A78BFA (purple-400)

---

## 11. Implementation Notes

### Scroll Behavior
- Use `scroll-behavior: smooth` in CSS for anchor link navigation
- Table of contents links use hash anchors: `#acceptance-of-terms`
- Offset scroll position by header height (64px) to prevent header overlap

### Content Management
- Terms content stored in markdown file: `content/terms.md`
- Version date updated manually when terms change
- Consider versioning system for legal compliance (future)

### Analytics Tracking
- Track page views
- Track table of contents link clicks (which sections users read)
- Track outbound link clicks (to privacy policy, email)
- Track time on page (engagement metric)

---

## 12. Related Pages

### Navigation Connections
- **From HomePage**: Footer link "Terms"
- **From SignupPage**: "By signing up, you agree to our Terms" link
- **From PrivacyPage**: Reference link back to Terms
- **From AboutPage**: Footer link "Terms"
- **To PrivacyPage**: In-content link in Section 7
- **To ContactPage**: For questions about terms
- **To HomePage**: Logo link in header

### User Journey
1. User creating account → clicks Terms link in signup footer → reads terms → returns to SignupPage
2. User browsing footer → clicks Terms → reads specific section → navigates to Privacy for more info
3. Vendor onboarding → directed to Terms (Section 3: Vendor Services) → understands obligations → continues registration

---

## 13. Future Enhancements

### Version History
- Add "Previous Versions" link at bottom
- Show changelog of what changed between versions
- Allow users to compare versions side-by-side

### Acceptance Tracking
- For authenticated users, track when they accepted current terms version
- Show "You accepted these terms on [date]" banner at top
- Require re-acceptance when terms change significantly

### Interactive Elements
- Add search functionality to find specific terms
- Highlight matching text when searching
- Add expandable/collapsible sections for better scanning

### Multi-language Support
- Add language selector at top
- Store translations for multiple languages
- Default to user's browser language preference

### Print Optimization
- Add dedicated print stylesheet
- "Download PDF" button generates PDF version
- Include signature line for printed copies

---

**End of TermsPage Specification**
