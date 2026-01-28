"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LinkIcon,
  MapPinIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TeamPage() {
  const founders = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'Former VP Engineering at Meta, led AI platform serving 3B+ users. Passionate about democratizing technology.',
      education: 'Stanford University - MS Computer Science',
      location: 'San Francisco, CA'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Co-Founder & CTO',
      bio: 'Ex-OpenAI research scientist with 25+ published papers on LLMs. Pioneer in multi-agent AI architectures.',
      education: 'MIT - PhD Computer Science (AI/ML)',
      location: 'San Francisco, CA'
    }
  ];

  const leadership = [
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI Research',
      bio: 'Former Google Brain researcher with expertise in hierarchical learning. 20+ patents in AI systems.',
      education: 'UC Berkeley - PhD Computer Science',
      location: 'Mountain View, CA'
    },
    {
      name: 'James Park',
      role: 'VP of Engineering',
      bio: 'Former Principal Engineer at Stripe, scaled payment systems to handle millions of transactions.',
      education: 'Carnegie Mellon - MS Software Engineering',
      location: 'San Francisco, CA'
    }
  ];

  const departments = [
    { name: 'Engineering', count: 12, openings: 3 },
    { name: 'AI Research', count: 6, openings: 2 },
    { name: 'Product', count: 4, openings: 1 },
    { name: 'Sales & Marketing', count: 5, openings: 2 },
    { name: 'Operations', count: 3, openings: 1 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet the Happy Llama Team
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We&apos;re a diverse team of engineers, researchers, and builders united by the mission 
              to democratize software development through AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/about/careers">Join Our Team</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="py-12 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto text-center">
            {departments.map((dept, index) => (
              <div key={index}>
                <div className="text-3xl font-bold mb-1">{dept.count}</div>
                <div className="text-blue-100 text-sm mb-1">{dept.name}</div>
                {dept.openings > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dept.openings} open
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Founders</h2>
            <p className="text-xl text-gray-600">
              The visionaries behind Happy Llama&apos;s mission
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {founders.map((founder, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xl">
                        {founder.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{founder.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{founder.role}</p>
                      <p className="text-gray-600 mb-4">{founder.bio}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{founder.education}</span>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{founder.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <Button variant="ghost" size="sm">
                          <LinkIcon className="h-4 w-4 mr-1" />
                          LinkedIn
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-600">
              Experienced leaders driving our mission forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {leadership.map((leader, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {leader.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{leader.name}</h3>
                      <p className="text-blue-600 font-medium mb-3">{leader.role}</p>
                      <p className="text-gray-600 text-sm mb-3">{leader.bio}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{leader.education}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{leader.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Join Team CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
            <p className="text-xl text-blue-100 mb-8">
              We&apos;re always looking for talented, passionate people to join our team
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/about/careers">View Open Positions</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Learn About Our Culture
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}