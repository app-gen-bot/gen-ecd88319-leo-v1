export interface UseCase {
  id: string
  title: string
  industry: string
  complexity: "Simple" | "Medium" | "Complex"
  buildTime: string
  description: string
  image: string
  tags: string[]
  userType: string[]
  popularity: number
  dateAdded: string
  challenge: string
  solution: string
  results: string[]
  techStack: string[]
}

export const useCasesData: UseCase[] = [
  {
    id: "healthcare-portal",
    title: "Healthcare Patient Portal",
    industry: "Healthcare",
    complexity: "Complex",
    buildTime: "4 hours",
    description: "HIPAA-compliant patient management system with appointments, records, and billing",
    image: "/stock_photos/unsplash_healthcare_medical_dashboard_RPHfplVYsmA_20250824_170319.jpg",
    tags: ["HIPAA", "Real-time", "Multi-tenant"],
    userType: ["Enterprise", "Startup Teams"],
    popularity: 95,
    dateAdded: "2024-02-15",
    challenge: "Healthcare providers needed a secure, compliant patient portal that could handle sensitive medical data while providing an intuitive user experience.",
    solution: "Happy Llama generated a complete HIPAA-compliant system with end-to-end encryption, role-based access control, and comprehensive audit logging.",
    results: [
      "30% reduction in appointment no-shows",
      "50% faster patient onboarding",
      "100% HIPAA compliance achieved"
    ],
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Redis", "AWS"]
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    industry: "Retail",
    complexity: "Medium",
    buildTime: "3 hours",
    description: "Full-featured online store with inventory, payments, and shipping integration",
    image: "/stock_photos/unsplash_ecommerce_dashboard_analytics_OU4yhezlNyk_20250824_170327.jpg",
    tags: ["Payment Gateway", "Inventory", "Analytics"],
    userType: ["Startup Teams", "Citizen Developer"],
    popularity: 88,
    dateAdded: "2024-02-10",
    challenge: "Small retailer needed to quickly launch online sales with limited technical resources and budget.",
    solution: "AI agents created a complete e-commerce solution with Stripe integration, inventory management, and automated shipping calculations.",
    results: [
      "$50K in first month sales",
      "200+ products launched",
      "Zero downtime since launch"
    ],
    techStack: ["Next.js", "Stripe", "DynamoDB", "CloudFront"]
  },
  {
    id: "saas-dashboard",
    title: "SaaS Analytics Dashboard",
    industry: "Technology",
    complexity: "Medium",
    buildTime: "2.5 hours",
    description: "Real-time analytics dashboard with custom visualizations and reporting",
    image: "/stock_photos/unsplash_ecommerce_dashboard_analytics_h_kuT-rHBHs_20250824_170327.jpg",
    tags: ["Real-time", "Webhooks", "API"],
    userType: ["Startup Teams", "Enterprise"],
    popularity: 92,
    dateAdded: "2024-02-20",
    challenge: "SaaS company needed a customer-facing analytics dashboard to differentiate their product.",
    solution: "Generated interactive dashboard with real-time data streaming, custom chart components, and export capabilities.",
    results: [
      "40% increase in user engagement",
      "Reduced support tickets by 25%",
      "Feature shipped 3 months ahead of schedule"
    ],
    techStack: ["React", "D3.js", "WebSockets", "Redis", "PostgreSQL"]
  },
  {
    id: "hr-management",
    title: "HR Management System",
    industry: "Enterprise",
    complexity: "Complex",
    buildTime: "5 hours",
    description: "Complete HR solution with recruitment, onboarding, and performance management",
    image: "/stock_photos/unsplash_abstract_technology_gradient_EHGxNsar-C4_20250824_165908.jpg",
    tags: ["Workflow", "Compliance", "Integration"],
    userType: ["Enterprise"],
    popularity: 78,
    dateAdded: "2024-01-28",
    challenge: "Enterprise needed to modernize paper-based HR processes while ensuring compliance with labor laws.",
    solution: "Built comprehensive HR platform with automated workflows, compliance checks, and integration with existing systems.",
    results: [
      "80% reduction in onboarding time",
      "100% compliance with regulations",
      "Saved $200K annually in HR costs"
    ],
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Temporal", "AWS Lambda"]
  },
  {
    id: "education-platform",
    title: "Online Learning Platform",
    industry: "Education",
    complexity: "Simple",
    buildTime: "2 hours",
    description: "Course management system with video streaming and progress tracking",
    image: "/stock_photos/unsplash_abstract_technology_gradient_7FKsGvJBPAE_20250824_165908.jpg",
    tags: ["Video", "LMS", "Gamification"],
    userType: ["Citizen Developer", "Startup Teams"],
    popularity: 85,
    dateAdded: "2024-02-05",
    challenge: "Educator wanted to create online courses but lacked technical skills and budget for developers.",
    solution: "Happy Llama created a complete LMS with video hosting, quiz builder, and student progress tracking.",
    results: [
      "500+ students enrolled in first month",
      "95% course completion rate",
      "Generated $10K in course sales"
    ],
    techStack: ["Next.js", "Vimeo API", "DynamoDB", "S3"]
  },
  {
    id: "finance-dashboard",
    title: "Financial Trading Dashboard",
    industry: "Finance",
    complexity: "Complex",
    buildTime: "6 hours",
    description: "Real-time trading platform with market data and portfolio management",
    image: "/stock_photos/unsplash_abstract_technology_gradient_-_cuKYAnoiE_20250824_165908.jpg",
    tags: ["Real-time", "WebSocket", "Security"],
    userType: ["Enterprise", "Startup Teams"],
    popularity: 90,
    dateAdded: "2024-02-18",
    challenge: "FinTech startup needed institutional-grade trading platform with real-time data feeds.",
    solution: "Generated secure trading platform with WebSocket connections, real-time charts, and risk management tools.",
    results: [
      "$1M+ daily trading volume",
      "Sub-millisecond latency",
      "Passed security audit"
    ],
    techStack: ["React", "WebSockets", "Redis", "PostgreSQL", "Kubernetes"]
  },
  {
    id: "inventory-management",
    title: "Inventory Management System",
    industry: "Retail",
    complexity: "Medium",
    buildTime: "3.5 hours",
    description: "Multi-location inventory tracking with automated reordering",
    image: "/stock_photos/unsplash_abstract_technology_gradient_EHGxNsar-C4_20250824_165908.jpg",
    tags: ["Barcode", "Multi-location", "Automation"],
    userType: ["Enterprise", "Startup Teams"],
    popularity: 75,
    dateAdded: "2024-01-20",
    challenge: "Retailer struggled with stock-outs and overstock across multiple locations.",
    solution: "Built intelligent inventory system with predictive reordering and real-time tracking.",
    results: [
      "35% reduction in stock-outs",
      "20% reduction in carrying costs",
      "ROI achieved in 2 months"
    ],
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Redis"]
  },
  {
    id: "crm-system",
    title: "Customer Relationship Management",
    industry: "Technology",
    complexity: "Complex",
    buildTime: "5.5 hours",
    description: "Full CRM with sales pipeline, customer support, and marketing automation",
    image: "/stock_photos/unsplash_abstract_technology_gradient_7FKsGvJBPAE_20250824_165908.jpg",
    tags: ["Automation", "Integration", "Analytics"],
    userType: ["Enterprise", "Startup Teams"],
    popularity: 87,
    dateAdded: "2024-02-12",
    challenge: "Growing company needed CRM that could scale with their rapid growth.",
    solution: "Created customizable CRM with workflow automation and third-party integrations.",
    results: [
      "2x increase in sales efficiency",
      "30% shorter sales cycles",
      "Unified customer view achieved"
    ],
    techStack: ["React", "Node.js", "MongoDB", "Redis", "AWS"]
  },
  {
    id: "booking-system",
    title: "Appointment Booking Platform",
    industry: "Healthcare",
    complexity: "Simple",
    buildTime: "1.5 hours",
    description: "Online booking system with calendar integration and reminders",
    image: "/stock_photos/unsplash_healthcare_medical_dashboard_Wk1iiNtYAvE_20250824_170319.jpg",
    tags: ["Calendar", "Notifications", "Integration"],
    userType: ["Citizen Developer", "Startup Teams"],
    popularity: 82,
    dateAdded: "2024-02-08",
    challenge: "Medical practice losing revenue from missed appointments and phone scheduling inefficiency.",
    solution: "Built automated booking system with SMS reminders and calendar sync.",
    results: [
      "50% reduction in no-shows",
      "Freed up 20 hours/week of staff time",
      "Patient satisfaction increased 30%"
    ],
    techStack: ["Next.js", "Twilio", "Google Calendar API", "PostgreSQL"]
  },
  {
    id: "project-management",
    title: "Project Management Tool",
    industry: "Technology",
    complexity: "Medium",
    buildTime: "4 hours",
    description: "Collaborative project management with Gantt charts and resource planning",
    image: "/stock_photos/unsplash_abstract_technology_gradient_-_cuKYAnoiE_20250824_165908.jpg",
    tags: ["Collaboration", "Gantt", "Resources"],
    userType: ["Enterprise", "Startup Teams"],
    popularity: 79,
    dateAdded: "2024-01-25",
    challenge: "Team struggling with project visibility and resource allocation across departments.",
    solution: "Generated comprehensive project management suite with real-time collaboration features.",
    results: [
      "25% improvement in project delivery",
      "Better resource utilization",
      "Improved team collaboration"
    ],
    techStack: ["React", "Socket.io", "PostgreSQL", "Redis"]
  },
  {
    id: "food-delivery",
    title: "Food Delivery Platform",
    industry: "Retail",
    complexity: "Complex",
    buildTime: "5 hours",
    description: "Multi-restaurant delivery platform with real-time tracking",
    image: "/stock_photos/unsplash_ecommerce_dashboard_analytics_OU4yhezlNyk_20250824_170327.jpg",
    tags: ["Real-time", "Maps", "Payments"],
    userType: ["Startup Teams"],
    popularity: 91,
    dateAdded: "2024-02-22",
    challenge: "Entrepreneur wanted to launch local food delivery service to compete with major platforms.",
    solution: "Built complete platform with restaurant onboarding, driver tracking, and customer apps.",
    results: [
      "100+ restaurants onboarded",
      "5000+ orders in first month",
      "Break-even achieved in 3 months"
    ],
    techStack: ["React Native", "Node.js", "MongoDB", "Redis", "Google Maps API"]
  },
  {
    id: "property-management",
    title: "Property Management System",
    industry: "Real Estate",
    complexity: "Medium",
    buildTime: "3.5 hours",
    description: "Tenant management, maintenance tracking, and rent collection",
    image: "/stock_photos/unsplash_abstract_technology_gradient_EHGxNsar-C4_20250824_165908.jpg",
    tags: ["Payments", "Maintenance", "Portal"],
    userType: ["Citizen Developer", "Enterprise"],
    popularity: 76,
    dateAdded: "2024-01-30",
    challenge: "Property management company using spreadsheets and paper for 500+ units.",
    solution: "Created digital platform with tenant portal, maintenance requests, and automated rent collection.",
    results: [
      "90% on-time rent collection",
      "50% faster maintenance resolution",
      "Eliminated paper processes"
    ],
    techStack: ["Next.js", "Stripe", "PostgreSQL", "SendGrid"]
  }
]