# Extended ShadCN Component Palette

## Architectural Principle

This document establishes an **Extended ShadCN Component Palette** that bridges the gap between UI Designer intent and Frontend Developer implementation. 

**Design Boundary**: UI Designers can specify components from this extended palette without needing to know implementation details.

**Implementation Boundary**: Frontend Developers handle the specific implementation approach (core ShadCN, custom component, or community extension).

## Core ShadCN Components

These are the official components available via `npx shadcn@latest add [component]`:

### Layout & Structure
- `accordion`, `aspect-ratio`, `card`, `collapsible`, `resizable`, `scroll-area`, `separator`, `sidebar`, `tabs`

### Navigation  
- `breadcrumb`, `command`, `context-menu`, `dropdown-menu`, `menubar`, `navigation-menu`, `pagination`

### Data Display
- `avatar`, `badge`, `calendar`, `carousel`, `chart`, `data-table`, `table`, `typography`

### Feedback
- `alert`, `alert-dialog`, `dialog`, `drawer`, `hover-card`, `popover`, `progress`, `skeleton`, `sonner`, `toast`, `tooltip`

### Forms & Input
- `button`, `checkbox`, `combobox`, `date-picker`, `form`, `input`, `input-otp`, `label`, `radio-group`, `select`, `sheet`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`

## Extended Components (Auto-Installed Templates)

These components extend the ShadCN design language with curated template-based implementations that install automatically like standard ShadCN components:

### Loading & State Management

#### Spinner
- **Designer Spec**: `spinner` or `loading-spinner`
- **Implementation**: ✅ **Auto-installed from template**
- **Reference**: [ShadCN UI Expansions - Spinner](https://shadcnui-expansions.typeart.cc/docs/spinner)
- **Usage**: For general loading states where `skeleton` is insufficient
- **Installation**: Works exactly like `shadcn add button` - zero coding required!

**How It Works:**
```bash
# Standard ShadCN Component
shadcn_add("button")  → pnpm dlx shadcn@latest add button -y

# Extended Component (NEW!)  
shadcn_add("spinner") → Auto-copies from local template to components/ui/spinner.tsx
```
Both provide **zero coding effort** - working component files appear automatically!

### Available Extended Components

Additional high-quality components available from the community:

**Source**: [ShadCN UI Expansions](https://shadcnui-expansions.typeart.cc/)

This curated collection provides production-ready components that follow ShadCN patterns:

- **Spinner**: Loading indicators with size variants ✅ *Currently implemented*
- **Multi-step Form/Wizard**: Step-by-step form progression
- **File Upload**: Drag-and-drop file upload with progress
- **Data Grid**: Enhanced table with sorting/filtering/pagination
- **Timeline**: Vertical timeline for status progression
- **Stats Cards**: Dashboard-style metric displays
- **Charts & Graphs**: Data visualization components
- **Advanced Forms**: Complex form controls and validation
- **Layout Components**: Advanced grid and flex utilities
- **Navigation**: Enhanced navigation patterns

### Implementation Priority

Components are added to our extended palette based on:
1. **Project Need**: Frequency of use across our applications
2. **Quality**: Well-documented, TypeScript-first implementations
3. **Maintenance**: Active community support and updates
4. **ShadCN Compatibility**: Follows established patterns and conventions

## Implementation Guidelines

### For UI Designers
1. Specify components from this extended palette in design specifications
2. Use component names from either core or extended sections
3. Include size, variant, and usage context
4. Don't specify implementation details (imports, styling specifics)

### For Frontend Developers
1. Check if component exists in core ShadCN first
2. For extended components, implement using provided patterns
3. Follow ShadCN conventions for styling and TypeScript interfaces
4. Create reusable implementations in `/components/ui/` directory

### Tool Integration  
The ShadCN MCP tool automatically:
- **Core Components**: Runs `pnpm dlx shadcn@latest add [component]` 
- **Extended Components**: Copies from local templates to `components/ui/`
- **Path Fixing**: Converts `@/` imports to relative paths automatically
- **Dependencies**: Auto-installs required packages (lucide-react, etc.)
- **Validation**: Provides suggestions for invalid component names

## Adding New Extended Components

To add a new component to the extended palette:

1. **Create Template**: 
   - Add `.tsx` file to `mcp-tools/src/mcp_tools/shadcn/templates/`
   - Source from [ShadCN UI Expansions](https://shadcnui-expansions.typeart.cc/) or create high-quality implementation
   - Use `@/lib/utils` imports (auto-converted to relative paths)

2. **Register Component**: Add to `EXTENDED_COMPONENTS` list in `server.py`
3. **Test Installation**: Verify template copies correctly and dependencies install  
4. **Update Documentation**: Add to this file and `shadcn-components.yaml` in Frontend Spec

### Criteria for Extended Components
- **ShadCN-Compatible**: Uses similar patterns and conventions
- **Reusable**: Applicable across multiple projects/contexts  
- **Well-Documented**: Clear implementation guidelines available
- **TypeScript-First**: Proper type definitions and interfaces
- **Accessible**: Follows accessibility best practices
- **Community Vetted**: Preferably from established sources like ShadCN UI Expansions

## Resources

### Component Sources
- **[ShadCN UI Expansions](https://shadcnui-expansions.typeart.cc/)**: Curated collection of community components
- **[ShadCN/ui Official](https://ui.shadcn.com/)**: Core component library
- **[Radix UI](https://www.radix-ui.com/)**: Primitive components (ShadCN foundation)

### Development Tools
- **[Lucide React](https://lucide.dev/)**: Icon library (standard for ShadCN ecosystem)
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Class Variance Authority](https://cva.style/)**: Component variant utilities

## Version History

- **v1.0**: Initial palette with core ShadCN components
- **v1.1**: Added Spinner component from ShadCN UI Expansions
- **v1.2**: Added reference to ShadCN UI Expansions as primary source for extended components
- **v2.0**: 🎉 **Template-Based Auto-Installation** - Extended components now install automatically like standard ShadCN components

---

*This palette evolves as we identify common UI patterns that benefit from standardized, reusable implementations while maintaining the ShadCN design philosophy.*