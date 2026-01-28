# Frontend Interaction Specification: HomePage

**Route**: `/`
**Layout**: Standard Layout (Header + Main + Footer)
**Purpose**: Public landing page showcasing the wedding vendor marketplace and guiding users to explore vendors or sign up.

---

## 1. Content Structure

### Hero Section
- **Background**: Dark slate background (#1E293B) with subtle texture
- **Heading**: "Find Your Perfect Wedding Vendors" (text-5xl font-bold text-white)
- **Subtitle**: "Connect with verified photographers, caterers, venues, and more for your special day" (text-xl text-slate-300)
- **CTA Buttons** (in flex row, gap-4):
  - **Primary Button**: "Browse Vendors" (purple bg #8B5CF6, white text, px-8 py-3 rounded-lg)
  - **Secondary Button**: "Get Started" (outline style, border-purple-500 text-purple-400, px-8 py-3 rounded-lg)

### Featured Categories Section
- **Section Heading**: "Explore Services" (text-3xl font-bold text-white, mb-8)
- **Categories Grid**: 3 columns on desktop, 2 on tablet, 1 on mobile (gap-6)
- **Category Cards** (11 total, one for each ServiceCategory):
  - Photography
  - Videography
  - Catering
  - Venue
  - Flowers
  - Music
  - Planning
  - Transportation
  - Cake
  - Decoration
  - Other

**Each Category Card**:
- Card background: #1E293B with hover effect (hover:bg-slate-700)
- Icon: Category-specific icon (top, centered)
- Label: Category name (text-lg font-semibold text-white)
- Count: "X vendors available" (text-sm text-slate-400)
- Clickable entire card

### Featured Vendors Section
- **Section Heading**: "Top Rated Vendors" (text-3xl font-bold text-white, mb-8)
- **Vendors Grid**: 4 columns on desktop, 2 on tablet, 1 on mobile (gap-6, max 8 vendors shown)

**Each Vendor Card**:
- Card background: #1E293B with hover shadow
- Vendor avatar/logo (rounded-full, 64px, top)
- Business name (text-lg font-semibold text-white)
- Category badge (purple badge, small text)
- Location: "City, State" (text-sm text-slate-400)
- Rating: Star icons + numeric rating + review count (text-sm text-slate-300)
- "Verified" badge if `isVerified: true` (green checkmark icon + text)
- "View Profile" link (text-purple-400 hover:text-purple-300)

### How It Works Section
- **Section Heading**: "Simple Steps to Your Dream Wedding" (text-3xl font-bold text-white, mb-8)
- **Steps Grid**: 3 columns (gap-8)

**Step Cards** (3 total):
1. **Step 1**: "Create Your Profile"
   - Icon: User icon (purple)
   - Description: "Sign up and tell us about your wedding date and preferences"
2. **Step 2**: "Browse & Connect"
   - Icon: Search icon (purple)
   - Description: "Explore verified vendors and reach out with messages"
3. **Step 3**: "Book Your Services"
   - Icon: Calendar icon (purple)
   - Description: "Review portfolios, compare pricing, and secure your vendors"

### Call-to-Action Section
- **Background**: Purple gradient background (#8B5CF6 to #6D28D9)
- **Heading**: "Ready to Start Planning?" (text-3xl font-bold text-white)
- **Subheading**: "Join thousands of couples finding their perfect vendors" (text-lg text-purple-100)
- **CTA Button**: "Sign Up Now" (white bg, purple text, px-8 py-3 rounded-lg, hover:bg-purple-50)

---

## 2. User Interactions

### Hero Section Interactions
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Primary Button | "Browse Vendors" | Navigate | VendorsSearchPage |
| Secondary Button | "Get Started" | Navigate | SignupPage |

### Featured Categories Interactions
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Category Card | "{Category Name}" | Navigate with filter | VendorsSearchPage (with `?category={category}` query param) |

**Example**: Clicking "Photography" card navigates to VendorsSearchPage with category filter pre-selected.

### Featured Vendors Interactions
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Vendor Card | Entire card clickable | Navigate | VendorDetailPage (with vendor ID) |
| "View Profile" Link | "View Profile" | Navigate | VendorDetailPage (with vendor ID) |

### Call-to-Action Section Interactions
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| CTA Button | "Sign Up Now" | Navigate | SignupPage |

### Header Navigation (from Standard Layout)
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Logo/Brand | "Timeless Weddings" | Navigate | HomePage |
| Nav Link | "Browse Vendors" | Navigate | VendorsSearchPage |
| Nav Link | "Services" | Navigate | ServicesBrowsePage |
| Nav Link | "Portfolios" | Navigate | PortfoliosBrowsePage |
| Nav Link | "About" | Navigate | AboutPage |
| Nav Link | "Contact" | Navigate | ContactPage |
| Button | "Log In" | Navigate | LoginPage |
| Button | "Sign Up" | Navigate | SignupPage |

### Footer Navigation (from Standard Layout)
| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Footer Link | "About Us" | Navigate | AboutPage |
| Footer Link | "Contact" | Navigate | ContactPage |
| Footer Link | "Terms of Service" | Navigate | TermsPage |
| Footer Link | "Privacy Policy" | Navigate | PrivacyPage |

---

## 3. API Integration

### On Page Load

**Fetch Featured Vendors**:
```typescript
const { data: vendorsData } = await apiClient.vendors.getVendors({
  query: {
    isVerified: true,
    isActive: true,
    sortBy: 'rating',
    sortOrder: 'desc',
    limit: 8,
    page: 1
  }
});

// vendorsData contains:
// {
//   vendors: Vendor[],
//   total: number,
//   page: number,
//   limit: number,
//   totalPages: number
// }
```

**Fetch Vendor Counts by Category**:
```typescript
// For each category, fetch count
const photographyCount = await apiClient.vendors.getVendors({
  query: {
    category: 'photography',
    isActive: true,
    limit: 1,
    page: 1
  }
});
// Use photographyCount.total for "X vendors available"

// Repeat for all 11 categories
```

**Alternative Approach** (if performance is concern):
- Hardcode approximate counts or fetch asynchronously after page load
- Show skeleton/loading for category counts initially

---

## 4. States

### Loading State
**When**: Initial page load, fetching vendors data
**UI**:
- Hero section: Render immediately (static content)
- Featured Categories: Show 11 skeleton cards (gray animated pulse rectangles)
- Featured Vendors: Show 8 skeleton cards (gray animated pulse with avatar circle, text lines)
- How It Works: Render immediately (static content)

### Success State
**When**: Vendors data successfully loaded
**UI**:
- Featured Categories: Display all 11 category cards with vendor counts
- Featured Vendors: Display up to 8 vendor cards with full data (avatar, name, rating, location, verified badge)

### Empty State
**When**: No featured vendors found (unlikely but possible)
**UI**:
- Featured Vendors Section: Show message "No featured vendors available at this time. Check back soon!"
- Still display Featured Categories (always populated)

### Error State
**When**: API call fails
**UI**:
- Featured Vendors Section: Show error message "Unable to load featured vendors. Please try again later."
- Retry button: "Retry" (purple outline button, onClick: refetch vendors)
- Featured Categories: Render with static data (no counts) to avoid blocking navigation

---

## 5. Component Details

### Category Card Component
- **Size**: 200px × 180px
- **Background**: #1E293B
- **Border**: 1px solid #334155 (subtle border)
- **Hover**: Background changes to #334155, slight shadow
- **Icon**: 48px, purple color (#8B5CF6), centered
- **Label**: Text-lg font-semibold text-white, centered below icon
- **Count**: Text-sm text-slate-400, centered below label

### Vendor Card Component
- **Size**: 280px × 320px
- **Background**: #1E293B
- **Border**: 1px solid #334155
- **Hover**: Shadow-lg, slight scale (1.02)
- **Avatar**: 64px rounded-full, centered at top with 16px margin
- **Business Name**: Text-lg font-semibold text-white, centered
- **Category Badge**: Small purple badge (#8B5CF6 bg, white text, rounded-full px-2 py-1)
- **Location**: Text-sm text-slate-400 with location pin icon
- **Rating**: Flex row with star icons (filled/half/empty), rating number, and review count in parentheses
- **Verified Badge**: Green checkmark icon + "Verified" text (text-xs text-green-400)
- **View Profile Link**: Text-purple-400 hover:text-purple-300 underline

### Step Card Component
- **Size**: Auto width, 240px min-height
- **Background**: #1E293B
- **Border**: 2px solid #8B5CF6 (purple accent)
- **Icon**: 64px purple icon at top, centered
- **Step Number**: Text-sm text-purple-400 "Step X"
- **Title**: Text-xl font-bold text-white
- **Description**: Text-base text-slate-300, centered

---

## 6. Responsive Behavior

### Desktop (≥1024px)
- Featured Categories: 3 columns
- Featured Vendors: 4 columns
- How It Works: 3 columns
- Hero buttons: Horizontal flex row

### Tablet (768px - 1023px)
- Featured Categories: 2 columns
- Featured Vendors: 2 columns
- How It Works: 2 columns (Step 3 spans full width)
- Hero buttons: Horizontal flex row

### Mobile (<768px)
- Featured Categories: 1 column
- Featured Vendors: 1 column
- How It Works: 1 column
- Hero buttons: Vertical flex column (full width buttons)
- Hero heading: Text-3xl (smaller)
- Hero subtitle: Text-base (smaller)

---

## 7. Accessibility

- **Keyboard Navigation**: All cards, buttons, and links are keyboard accessible (Tab order: Hero buttons → Category cards → Vendor cards → CTA button)
- **Focus Indicators**: Visible purple outline (#8B5CF6) on focus for all interactive elements
- **Screen Readers**:
  - Category cards have aria-label: "Browse {category} vendors"
  - Vendor cards have aria-label: "{Business Name}, {category} vendor in {location}, rated {rating} stars"
  - "Verified" badge has aria-label: "Verified vendor"
- **Alt Text**: All images/icons have descriptive alt text
- **Color Contrast**: All text meets WCAG AA standards (white/slate-300 on dark slate backgrounds)

---

## 8. Performance Considerations

- **Image Optimization**: Vendor avatars lazy-loaded with placeholder blur
- **Code Splitting**: Hero and static sections render immediately, vendor data loads asynchronously
- **Caching**: Vendor data cached for 5 minutes (stale-while-revalidate strategy)
- **Pagination**: Only load 8 featured vendors (limit page weight)
- **Category Counts**: Consider client-side caching or static approximations to reduce API calls

---

## 9. SEO & Meta Tags

- **Title**: "Timeless Weddings - Find Your Perfect Wedding Vendors"
- **Description**: "Connect with verified wedding photographers, caterers, venues, and more. Browse top-rated vendors for your special day."
- **Keywords**: "wedding vendors, wedding planning, photographers, caterers, venues"
- **Open Graph**: Image, title, description for social sharing

---

## 10. Design Tokens Reference (from Master Spec)

- **Background Colors**:
  - Primary background: #0F172A
  - Card background: #1E293B
  - Hover background: #334155
- **Text Colors**:
  - Primary text: white
  - Secondary text: #CBD5E1 (slate-300)
  - Muted text: #94A3B8 (slate-400)
- **Accent Color**: #8B5CF6 (purple)
- **Spacing**: 8px base unit (use multiples: 8px, 16px, 24px, 32px, 48px, 64px)
- **Border Radius**:
  - Small: 4px
  - Medium: 8px
  - Large: 12px
  - Full: 9999px (circles)
- **Typography**:
  - Font family: Inter
  - Headings: font-bold
  - Body: font-normal

---

## 11. Future Enhancements (Not in Current Scope)

- Search bar in hero section for quick vendor search
- Testimonials carousel from couples
- Blog/Articles section with wedding planning tips
- Newsletter signup form
- Live chat widget for instant support
- Analytics tracking for category card clicks
- A/B testing for CTA button copy

---

**End of Specification**
