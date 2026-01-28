# Extracted Design System from Reference Site
## Source: https://timeless-weddings.vercel.app/

**Extraction Date**: October 5, 2025
**Method**: Visual analysis using browser screenshots
**Purpose**: Create accurate design system for generator to match reference

---

## 1. Color Palette (Extracted from Screenshots)

### Primary Colors
```css
/* Brand Purple - Primary Accent */
--brand-purple: #8B5CF6;           /* Used for: CTA buttons, badges, brand text */
--brand-purple-hover: #7C3AED;     /* Button hover state */

/* Blue Gradient - Hero Sections */
--hero-blue-start: #3B82F6;        /* Hero gradient start */
--hero-blue-end: #8B5CF6;          /* Hero gradient end (purple) */
```

### Background Colors
```css
/* Dark Navy/Slate Theme - NOT Pure Black */
--bg-primary: #0F172A;             /* Main background (Slate 900) */
--bg-secondary: #1E293B;           /* Cards, elevated surfaces (Slate 800) */
--bg-tertiary: #334155;            /* Borders, dividers (Slate 700) */
--bg-card-dark: #1E293B;           /* Package cards */
--bg-dropdown: #1E293B;            /* Dropdown menus */
```

### Text Colors
```css
--text-primary: #FAFAFA;           /* Main text (white) */
--text-secondary: #94A3B8;         /* Descriptions, secondary text (Slate 400) */
--text-muted: #64748B;             /* Muted text (Slate 500) */
```

### Semantic Colors
```css
--success-green: #10B981;          /* Checkmarks, success states */
--badge-purple: #8B5CF6;           /* "Most Popular" badges */
```

### Observed Patterns
- **NO pink colors** (#EC4899 NOT used in reference)
- **NO pure black** (#000000 NOT used)
- **NO yellow text** (User complaint about generated version)
- **Solid colors preferred** over gradients (except hero sections)

---

## 2. Typography

### Font Families
```css
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;
--font-display: 'Inter', sans-serif;  /* Same as body, no separate display font */
```

### Font Sizes (Observed)
```css
/* Hero Section */
--hero-title: 56px;                /* "Your Dream Vegas Wedding, Simplified" */

/* Section Headings */
--h1: 48px;                        /* "Our Wedding Venues" */
--h2: 36px;                        /* "Choose Your Perfect Package" */
--h3: 24px;                        /* Card titles: "The Grand Chapel" */

/* Body Text */
--body-large: 18px;                /* Hero descriptions */
--body: 16px;                      /* Standard text */
--body-small: 14px;                /* Feature lists, metadata */
```

### Font Weights (Observed)
```css
--weight-hero: 700;                /* Hero titles - Bold, NOT 800 */
--weight-heading: 600;             /* Section headings - Semibold */
--weight-body: 400;                /* Regular text */
--weight-medium: 500;              /* Buttons, emphasized text */
```

### Key Typography Rules
- ❌ **NOT** using font-weight 800 (too heavy)
- ✅ Using 700 max for heroes
- ✅ Clean, readable Inter font throughout
- ✅ No separate "Sora" or display fonts

---

## 3. Component Patterns

### 3.1 Buttons

#### Primary CTA (Purple Solid)
```css
.btn-primary {
  background: #8B5CF6;             /* Solid purple, NOT gradient */
  color: #FFFFFF;
  padding: 14px 32px;
  border-radius: 8px;              /* Moderately rounded (0.5rem) */
  font-weight: 600;
  font-size: 16px;
  border: none;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: #7C3AED;             /* Slightly darker */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}
```

#### Secondary CTA (Outline)
```css
.btn-secondary {
  background: transparent;
  color: #FFFFFF;
  padding: 14px 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
}
```

**Key Observations**:
- ✅ Solid purple, NOT gradients
- ✅ 8px border radius (0.5rem), NOT fully rounded
- ✅ Subtle shadow on hover
- ❌ NO glow effects in default state

### 3.2 Cards

#### Package Cards (3-Column Grid)
```css
.package-card {
  background: #1E293B;             /* Dark slate, NOT pure black */
  border: 1px solid #334155;       /* Subtle border */
  border-radius: 12px;             /* 0.75rem */
  padding: 24px;
  transition: all 300ms ease;
}

.package-card:hover {
  transform: translateY(-4px);
  border-color: #475569;           /* Slightly lighter on hover */
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}
```

#### Venue Cards (2-Column Grid on Venues Page)
```css
.venue-card {
  background: #1E293B;
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 300px 1fr;  /* Image + content */
}

.venue-card-image {
  width: 300px;
  height: 100%;
  object-fit: cover;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);  /* Placeholder gradient */
}
```

**Key Observations**:
- ✅ Dark slate backgrounds (#1E293B), NOT black
- ✅ Subtle borders, NOT heavy glassmorphism
- ✅ Simple elevation on hover
- ❌ NO backdrop-filter or blur effects

### 3.3 Badges

#### "Most Popular" Badge
```css
.badge-popular {
  background: #8B5CF6;
  color: #FFFFFF;
  padding: 6px 16px;
  border-radius: 20px;             /* Fully rounded pill */
  font-size: 14px;
  font-weight: 600;
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
}
```

### 3.4 Hero Sections

#### Homepage Hero
```css
.hero-home {
  background: url('/chapel-photo.jpg') center/cover;
  min-height: 100vh;
  position: relative;
}

.hero-home::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(139, 92, 246, 0.3));
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  line-height: 1.2;
  color: #FFFFFF;
}
```

#### Venues Page Hero
```css
.hero-venues {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);  /* Blue to purple */
  padding: 80px 24px;
}

.hero-venues h1 {
  font-size: 48px;
  font-weight: 700;
  color: #FFFFFF;
}
```

**Key Observations**:
- ✅ Blue-to-purple gradient for section heroes
- ✅ Photo backgrounds with overlay on homepage
- ❌ NOT using pure purple backgrounds

### 3.5 Feature Lists

```css
.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #FAFAFA;
}

.feature-icon {
  color: #10B981;                  /* Green checkmark */
  width: 20px;
  height: 20px;
}
```

### 3.6 Navigation

#### Top Navigation
```css
.navbar {
  background: rgba(15, 23, 42, 0.8);  /* Semi-transparent dark */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.nav-link {
  color: #FAFAFA;
  font-size: 16px;
  font-weight: 500;
  transition: color 200ms ease;
}

.nav-link:hover {
  color: #8B5CF6;                  /* Purple on hover */
}
```

---

## 4. Layout & Spacing

### Grid Systems

#### 3-Column Package Grid
```css
.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .packages-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .packages-grid {
    grid-template-columns: 1fr;
  }
}
```

#### 2-Column Venue Grid
```css
.venues-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 1400px;
}

@media (max-width: 1024px) {
  .venues-grid {
    grid-template-columns: 1fr;
  }
}
```

### Spacing Scale (Observed)
```css
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
--space-4xl: 80px;
```

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1200px;
--container-2xl: 1400px;
```

---

## 5. Effects & Animations

### Shadows
```css
/* Subtle shadows - NOT heavy drop shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.5);
--shadow-purple: 0 4px 12px rgba(139, 92, 246, 0.4);  /* Button hover */
```

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Key Animation Rules
- ✅ Subtle hover lift (2-4px translateY)
- ✅ Smooth color transitions
- ✅ Gentle shadow expansion
- ❌ NO complex glassmorphism
- ❌ NO heavy blur effects
- ❌ NO glow effects (except button hover)

---

## 6. Icons & Imagery

### Icon Style
- Using outline/line icons (not solid fills)
- Icon size: 20-24px typically
- Colors:
  - Success/features: Green (#10B981)
  - Amenities: White/Slate
  - Navigation: Purple on hover

### Image Patterns

#### Package Cards
```css
.package-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}
```

#### Venue Cards
```css
.venue-image {
  width: 300px;
  height: 100%;
  object-fit: cover;
}
```

**Photography Style**:
- Professional wedding photography
- Warm tones
- Well-lit venues
- Real wedding scenes (not stock photos)

---

## 7. Key Differences from Generated Version

### ❌ What Generated Version Got Wrong
1. **Colors**:
   - Using pure black (#0A0A0B) instead of dark slate (#0F172A)
   - Adding pink (#EC4899) when reference has NO pink
   - Yellow text in dropdowns (shadcn bug)

2. **Typography**:
   - Font-weight 800 (too heavy) instead of 700
   - 72px heroes instead of 56px
   - Using "Sora" font when reference uses only Inter

3. **Components**:
   - Gradient buttons instead of solid purple
   - Heavy glassmorphism instead of simple cards
   - Fully rounded buttons (9999px) instead of 8px

4. **Layout**:
   - Filter sidebar (reference has none)
   - Wrong grid columns (3-col when should be 2-col for venues)

### ✅ What to Match
1. **Colors**: Dark slate (#0F172A, #1E293B), purple (#8B5CF6), blue heroes (#3B82F6)
2. **Typography**: Inter 700 max, 56px heroes, clean weights
3. **Buttons**: Solid purple, 8px radius, subtle shadows
4. **Cards**: Simple dark slate, subtle borders, no heavy effects
5. **Layout**: Proper grid systems, no unnecessary sidebars

---

## 8. CSS Variables for Implementation

### Complete Design Token Set
```css
:root {
  /* Colors */
  --brand-purple: #8B5CF6;
  --brand-purple-hover: #7C3AED;
  --hero-blue: #3B82F6;

  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-tertiary: #334155;

  --text-primary: #FAFAFA;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  --success: #10B981;
  --border: #334155;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 24px;
  --text-2xl: 36px;
  --text-3xl: 48px;
  --text-4xl: 56px;

  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Spacing */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 80px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.5);
  --shadow-purple: 0 4px 12px rgba(139, 92, 246, 0.4);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## 9. Design Principles (Inferred)

### Visual Style
- **Clean & Professional**: Not overly stylized or futuristic
- **Approachable**: Warm photography, friendly copy
- **Modern**: Contemporary design without being trendy
- **Trust-Building**: Professional aesthetic for wedding planning

### Color Philosophy
- **Purple = Brand/Action**: CTAs, badges, highlights
- **Blue = Hero/Trust**: Section headers, hero gradients
- **Dark Slate = Foundation**: Never pure black, always soft navy
- **Green = Success**: Checkmarks, positive actions

### Typography Philosophy
- **One Font Family**: Inter for everything (simplicity)
- **Moderate Weights**: Never exceed 700, keep it readable
- **Clear Hierarchy**: Size and weight create clear levels
- **Generous Line Heights**: 1.5-1.6 for body text

### Component Philosophy
- **Simplicity Over Complexity**: Avoid over-engineering
- **Subtle Effects**: Gentle hovers, no flashy animations
- **Consistency**: Same patterns throughout
- **Mobile-First**: Responsive from the start

---

## 10. Implementation Checklist

### For CSS Patch (Immediate)
- [x] Change backgrounds from black to dark slate
- [x] Remove all pink colors
- [x] Change buttons from gradient to solid purple
- [x] Update shadcn variables to match
- [x] Fix border radius (0.5rem not 9999px)
- [x] Update gradient direction (blue → purple not purple → pink)

### For Generator Updates (Long-term)
- [ ] Create Design System Extractor Agent
- [ ] Extract colors from screenshots automatically
- [ ] Generate CSS variables from design system JSON
- [ ] Update FIS Master to use extracted design
- [ ] Add validation step to compare generated vs reference
- [ ] Make system work for ANY design reference

---

## Summary

**Reference Design**: Clean, professional marketing site with dark slate backgrounds, purple accents, and blue hero sections.

**NOT**: Ultra-futuristic, pure black, pink-heavy, or gradient-obsessed.

**Key Takeaway**: The reference is MUCH simpler and more professional than the fictional "ASTOUNDING 2035" aesthetic we invented. Future generators must EXTRACT design from references, not INVENT fictional aesthetics.
