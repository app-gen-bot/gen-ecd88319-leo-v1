# Chrome DevTools Testing Pattern

**Purpose:** Browser automation testing for console errors, network failures, and visual rendering

---

## MANDATORY: Visual Rendering Checks

**Every page must verify**:
- ✅ Page renders (not blank/white screen)
- ✅ Styling present (rounded corners, shadows, gradients visible)
- ✅ Dark mode active (dark background, not white)
- ✅ Layout correct (no overlapping elements, proper spacing)

**How to verify**: Take screenshot with `filePath` and visually inspect output file.

---

## CRITICAL: Always Use filePath Parameter for Screenshots

**⚠️ MANDATORY**: ALWAYS use `filePath` parameter when taking screenshots to avoid buffer overflow.

**Why This Matters**:
- **Without filePath**: Screenshot returns as base64-encoded image in JSON (can exceed 1MB buffer limit)
- **With filePath**: Screenshot saves to disk, returns only file path string (<100 bytes)

**Required Pattern** (safe for any app size):
```python
screenshot = mcp__chrome_devtools__take_screenshot(
    filePath="./screenshots/test.png",  # Saves to disk, returns path only
    fullPage=True
)
```

**Also Important**:
- **❌ DO NOT use `take_snapshot()`** - Returns massive DOM trees that exceed buffer limit
- **✅ USE `take_screenshot(filePath=...)`** - Visual verification without buffer issues

---

## Complete Testing Flow

```python
# Step 1: Open URL (local OR production)
mcp__chrome_devtools__new_page("http://localhost:5000")  # or https://app.fly.dev

# Step 2: CRITICAL - Check console (ZERO errors required)
messages = mcp__chrome_devtools__list_console_messages()
errors = [m for m in messages if m.level == "error"]
if errors:
    for error in errors:
        details = mcp__chrome_devtools__get_console_message(error.msgid)
        # Report: message, stack trace, source file:line

# Step 3: Check network requests (all should succeed)
requests = mcp__chrome_devtools__list_network_requests()
failed = [r for r in requests if r.status >= 400]
if failed:
    for req in failed:
        details = mcp__chrome_devtools__get_network_request(req.reqid)
        # Report: URL, status, headers, response body

# Step 4: Test user flows
mcp__chrome_devtools__fill("input[name='email']", "test@example.com")
mcp__chrome_devtools__click("button[type='submit']")
mcp__chrome_devtools__wait_for("Dashboard")

# Step 5: MANDATORY - Take screenshots with filePath (prevents buffer overflow)
# Always use filePath to save screenshot to disk (avoids 1MB+ base64 in JSON)
screenshot_path = mcp__chrome_devtools__take_screenshot(
    filePath="./screenshots/test.png",
    fullPage=True
)

# Step 6: Analyze screenshot from user perspective
# - Verify app displays correctly (no broken HTML)
# - Check CSS is loaded (proper styling, layout, colors)
# - Confirm functionality is visible (buttons, forms, content)
# - Look for visual bugs (overlapping elements, missing images, broken layouts)
# - Validate user experience (readable text, proper spacing, professional appearance)
```

---

## MANDATORY: Screenshot Analysis

**CRITICAL**: ALWAYS take screenshots during testing and analyze them from user's perspective.

### When to Take Screenshots

1. **Every Page Load**: After navigating to any page
2. **After User Actions**: After clicks, form submissions, navigation
3. **Error States**: When errors occur or unexpected behavior detected
4. **Success States**: After successful operations (login, CRUD, etc.)

### What to Analyze in Screenshots

#### 1. HTML Structure Validation
- ✅ Content is visible and properly rendered
- ✅ No "undefined" or "[Object object]" text displayed
- ✅ No empty white screens
- ✅ Page structure matches expected layout
- ❌ Missing content or placeholder text
- ❌ Broken HTML (unclosed tags, malformed structure)

#### 2. CSS Loading Verification
- ✅ Proper styling applied (colors, fonts, spacing)
- ✅ Layout is correct (flexbox/grid working)
- ✅ Buttons and inputs are styled
- ✅ Responsive design elements visible
- ❌ Unstyled HTML (default browser styles only)
- ❌ Missing background colors or gradients
- ❌ Broken layouts or overlapping elements

#### 3. Design Quality Check
- ✅ Professional appearance
- ✅ Consistent spacing and alignment
- ✅ Readable text (contrast, font size)
- ✅ Icons and images load correctly
- ✅ Dark mode colors applied (if applicable)
- ❌ Cluttered or unprofessional layout
- ❌ Poor contrast or unreadable text
- ❌ Missing images (broken image icons)

#### 4. Functionality Visibility
- ✅ Navigation elements present
- ✅ Action buttons visible and clickable
- ✅ Forms display all required fields
- ✅ Data displays in tables/lists/cards
- ✅ Loading states visible when appropriate
- ❌ Hidden or missing critical UI elements
- ❌ Buttons without labels
- ❌ Empty states without helpful messages

#### 5. User Experience Validation
- ✅ App does what it's supposed to do (main functionality visible)
- ✅ User can understand how to interact with the app
- ✅ Call-to-action elements are clear
- ✅ Error messages are helpful
- ✅ Success feedback is shown
- ❌ Confusing or unclear interface
- ❌ No indication of how to proceed
- ❌ Missing user guidance

### Screenshot Analysis Pattern

```python
# 1. Take screenshot (ALWAYS use filePath to avoid buffer overflow)
screenshot_path = mcp__chrome_devtools__take_screenshot(
    filePath="./screenshots/page_name.png",
    fullPage=True
)

# 2. Analyze screenshot content
# Ask yourself these questions:
# - Does this look like a professional web application?
# - Can a user understand what this page does?
# - Is the HTML rendered correctly?
# - Are CSS styles loaded and applied?
# - Are there any visual bugs or broken elements?
# - Would a user be able to complete their task?

# 3. Report findings
if visual_issues_found:
    # Document specific issues:
    # - "CSS not loaded: buttons are unstyled"
    # - "Broken HTML: content overlapping in header"
    # - "Missing images: broken image icons in gallery"
    # - "Poor UX: no indication of how to create new item"
```

### Example Screenshot Analysis Report

```markdown
## Screenshot Analysis: Homepage

**Screenshot**: screenshots/homepage_1234.png

### Visual Quality: ✅ PASS
- CSS loaded correctly, dark mode colors applied
- Professional layout with proper spacing
- All images loaded successfully

### Functionality: ✅ PASS
- Navigation clearly visible
- "Get Started" CTA button prominent
- Feature cards display expected content

### Issues Found: None

---

## Screenshot Analysis: Dashboard

**Screenshot**: screenshots/dashboard_1234.png

### Visual Quality: ❌ FAIL
- CSS not loaded: elements have default browser styling
- Layout broken: sidebar overlaps main content

### Functionality: ⚠️ PARTIAL
- Data table visible but unstyled
- Action buttons present but hard to identify

### Issues Found:
1. CSS file not loading (check network requests for 404)
2. Layout CSS issue causing sidebar overlap
3. Button styles missing (check Tailwind CSS compilation)
```

---

## Why This Matters

**Console errors** indicate bugs.
**Failed network requests** break functionality.
**Screenshots** verify user-facing quality.
**Visual analysis** catches CSS/HTML issues that console logs miss.

Chrome DevTools provides complete view of runtime behavior from both technical and user perspectives.
