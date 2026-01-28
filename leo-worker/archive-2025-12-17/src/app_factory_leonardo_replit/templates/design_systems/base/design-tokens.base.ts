/**
 * Design System Tokens
 * Generated design tokens for consistent styling across the application
 */

export const designTokens = {
  // Standard ShadCN component classes
  components: {
    button: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    card: {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      hover: "transition-shadow hover:shadow-md",
      selected: "ring-2 ring-primary",
    },
    input: {
      default: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    },
    badge: {
      default: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
    }
  },

  // Layout utilities
  layout: {
    container: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-16",
    sectionLg: "py-24",
    grid: "grid gap-6",
    gridMd: "md:grid-cols-2",
    gridLg: "lg:grid-cols-3",
  },

  // Typography scale
  typography: {
    h1: "text-4xl font-bold tracking-tight lg:text-5xl",
    h2: "text-3xl font-bold tracking-tight",
    h3: "text-2xl font-semibold tracking-tight",
    h4: "text-xl font-semibold",
    body: "text-base text-muted-foreground",
    small: "text-sm text-muted-foreground",
  },

  // DOMAIN_TOKENS_PLACEHOLDER - Will be replaced by agent with domain-specific tokens
} as const;

export default designTokens;