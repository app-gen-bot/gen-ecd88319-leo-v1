# 🎨 2025 Design Best Practices Cheat Sheet

## 1. Core Principles (Non-Negotiable)

-   **Clarity** → readability and hierarchy first (never sacrifice for
    style).\
-   **Restraint** → fewer colors, less clutter, purposeful visuals.\
-   **Consistency** → systematic use of tokens (colors, spacing,
    radii).\
-   **Accessibility** → WCAG AA/AAA contrast, keyboard focus, large
    targets.\
-   **Performance** → design light enough for low-end devices.

------------------------------------------------------------------------

## 2. Style Trends in 2025

  ---------------------------------------------------------------------------
  Style                     Description        Best Use       Pitfalls
  ------------------------- ------------------ -------------- ---------------
  **Glassmorphism**         Frosted,           Modals,        Overuse =
                            translucent layers navbars,       gaudy, poor
                            with blur + subtle overlays,      contrast, GPU
                            borders.           background     heavy.
                                               cards.         

  **Neumorphism**           Soft shadows,      Niche, playful Low contrast,
                            extruded "plastic" personal apps. inaccessible,
                            UI.                               looks outdated.

  **Flat + Elevation        Mostly flat        Enterprise     If depth isn't
  Hybrid**                  surfaces with      dashboards,    systematic, can
                            selective depth    scheduling     look messy.
                            (shadows, glass    apps, CRMs.    
                            panels, borders).                 

  **Soft Gradients**        Subtle,            Buttons,       Neon gradients
                            low-saturation     accent         = bad.
                            gradient fills.    backgrounds.   

  **Dark Mode**             Equal priority     All apps,      Not just
                            with light mode.   especially     inverted
                                               enterprise.    colors;
                                                              requires tuned
                                                              palette.

  **Micro-interactions**    Tiny animations    Buttons,       Too much =
                            for feedback.      hover,         distracting.
                                               toggles,       
                                               transitions.   
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

## 3. Color Guidelines

-   **Base** → neutral grays/whites/blacks.\
-   **Accent** → 1 (maybe 2) per app (e.g., violet, cyan, blush).\
-   **Semantic** → success/warning/error (muted, not neon).\
-   **Contrast** → 4.5:1 minimum (AA).\
-   **Brand Adaptation** → allow accent swap for personalization.

------------------------------------------------------------------------

## 4. Typography

-   **Sans-serif first** (Inter, SF Pro, Geist).\
-   **Scale** → modular (12--72px, ratio 1.125--1.2).\
-   **Weight** → light (300) only for large headers; body = 400--500;
    emphasis = 600+.\
-   **Line height** → 1.5--1.6 for body, 1.2 for headings.

------------------------------------------------------------------------

## 5. Layout & Spacing

-   **Base unit** → 8px (or 4px for fine detail).\
-   **Containers** → max-widths 720/960/1200px.\
-   **Grid** → 12 columns, 24px gutters.\
-   **White space** → generous; avoid cramped UI.

------------------------------------------------------------------------

## 6. Components (Best Practice Defaults)

-   **Buttons** → solid accent, subtle glass, or ghost. Always with
    hover/active states.\
-   **Inputs** → glass/light surfaces, clear borders, strong focus
    ring.\
-   **Cards** → flat or glass, rounded corners, soft shadows.\
-   **Navbar** → translucent, sticky, blurred; simple iconography.\
-   **Modals** → dark scrim + frosted panel.\
-   **Tables** → min row height 44px; zebra striping optional.\
-   **Toasts/Alerts** → semantic colors, accessible text contrast.

------------------------------------------------------------------------

## 7. Motion & Interaction

-   **Durations** → 150--250ms (hover, press).\
-   **Easing** → ease-out for entrances, spring for toggles.\
-   **Reduced Motion** → respect user preference
    (`prefers-reduced-motion`).\
-   **Feedback** → micro-animations only (scale 1.01 on hover, 0.99 on
    press).

------------------------------------------------------------------------

## 8. Do's & Don'ts (Quick Reference)

✅ Do\
- Use glassmorphism sparingly for depth.\
- Provide light & dark mode.\
- Stick to 1 accent + neutrals.\
- Focus on readability & spacing.\
- Add motion only where it improves clarity.

❌ Don't\
- Use neon or clashing colors.\
- Apply blur on every panel.\
- Flatten everything to the point of no hierarchy.\
- Use neumorphism in enterprise contexts.\
- Forget accessibility (contrast, focus, target size).

------------------------------------------------------------------------

## 9. For Your AI Prompting

When generating design systems, tell it:\
\> "Follow 2025 design best practices. Use a **flat + elevation hybrid
system** with **subtle glassmorphism accents**, restrained palette,
accessibility, dark mode, and micro-interactions. Avoid neon,
neumorphism, and gaudy gradients."
