"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior AI Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$180K - $250K',
      description: 'Build next-generation AI systems for code generation and multi-agent architectures.',
      requirements: ['5+ years ML/AI experience', 'Python, PyTorch/TensorFlow', 'LLM experience preferred']
    },
    {
      title: 'Full-Stack Engineer',
      department: 'Engineering', 
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$150K - $200K',
      description: 'Develop our React/Next.js frontend and Python/FastAPI backend platform.',
      requirements: ['4+ years full-stack experience', 'React, TypeScript, Python', 'Cloud platforms (AWS/GCP)']
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time', 
      salary: '$160K - $220K',
      description: 'Drive product strategy for developer tools and AI-powered experiences.',
      requirements: ['5+ years PM experience', 'Developer tools background', 'Technical depth']
    },
    {
      title: 'Enterprise Sales Director',
      department: 'Sales',
      location: 'San Francisco, CA / New York, NY',
      type: 'Full-time',
      salary: '$180K + equity + commission',
      description: 'Lead enterprise sales efforts and build relationships with Fortune 500 customers.',
      requirements: ['8+ years B2B sales', 'Enterprise software experience', 'Developer tools preferred']
    }
  ];

  const benefits = [
    'Competitive salary and significant equity',
    'Comprehensive health, dental, and vision insurance',
    'Unlimited PTO and flexible work arrangements',
    'Top-tier equipment and home office stipend',
    'Learning & development budget ($5K annually)',
    'Catered meals and snacks in SF office',
    'Annual company retreats and team events',
    'Commuter benefits and wellness programs'
  ];

  const values = [
    {
      title: 'Move Fast',
      description: 'We iterate quickly, learn from feedback, and ship features that matter.'
    },
    {
      title: 'Think Big',
      description: 'We&apos;re building technology that will transform how software is created.'
    },
    {
      title: 'Stay Humble',
      description: 'We listen to users, admit mistakes, and continuously improve.'
    },
    {
      title: 'Have Fun',
      description: 'We enjoy the journey and celebrate wins together as a team.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Join the Happy Llama Team
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Help us democratize software development and empower millions of creators worldwide. 
              We&apos;re building the future of AI-powered development tools.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">25+</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">$25M</div>
                <div className="text-sm text-gray-600">Series A Raised</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">5K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Open Positions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">
              Join us in building the future of software development
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <BuildingOfficeIcon className="h-3 w-3" />
                          {position.department}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {position.type}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-3 w-3" />
                          {position.salary}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button size="lg" className="whitespace-nowrap">
                      Apply Now
                    </Button>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{position.description}</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {position.requirements.map((req, i) => (
                        <li key={i}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don&apos;t see the right role? We&apos;re always interested in talking to exceptional talent.
            </p>
            <Button variant="outline">Send Us Your Resume</Button>
          </div>
        </div>
      </div>

      {/* Benefits & Culture */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits & Perks</h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
                <div className="space-y-6">
                  {values.map((value, index) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <UserGroupIcon className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of the team democratizing software development for millions of creators
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                View All Positions
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}