'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RocketLaunchIcon,
  LightBulbIcon,
  HeartIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AboutPage() {
  const coreValues = [
    {
      icon: <LightBulbIcon className="h-8 w-8 text-yellow-600" />,
      title: 'Innovation First',
      description: 'We believe in pushing the boundaries of what\'s possible with AI and software development.'
    },
    {
      icon: <HeartIcon className="h-8 w-8 text-red-600" />,
      title: 'Human-Centered',
      description: 'Technology should empower people, not replace them. We build tools that augment human creativity.'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-blue-600" />,
      title: 'Inclusive Access',
      description: 'Great ideas shouldn\'t be limited by technical barriers. We democratize software creation.'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-green-600" />,
      title: 'Global Impact',
      description: 'We\'re building solutions that can transform industries and improve lives worldwide.'
    }
  ];

  const milestones = [
    { year: '2023', event: 'Company Founded', description: 'Sarah and Marcus start Happy Llama with a vision to democratize app development' },
    { year: '2023', event: 'Pre-Seed Funding', description: '$2.5M raised from Founders Fund to build initial platform' },
    { year: '2024', event: 'Beta Launch', description: 'First 1,000 beta users create over 10,000 applications' },
    { year: '2024', event: 'Series A', description: '$25M Series A led by Sequoia Capital for enterprise expansion' },
    { year: '2024', event: '5,000+ Users', description: 'Platform scales to serve thousands of builders worldwide' },
    { year: '2025', event: 'Enterprise Ready', description: 'Launch enterprise features with Fortune 500 pilot programs' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              We&apos;re on a Mission to Democratize Software Development
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Happy Llama was founded on the belief that great ideas shouldn&apos;t be limited by technical barriers. 
              We&apos;re building AI that empowers everyone to create production-ready applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/about/team">
                  Meet Our Team
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about/careers">
                  Join Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <SparklesIcon className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed">
              To democratize software development by creating AI that transforms ideas into production-ready 
              applications, empowering millions of creators, entrepreneurs, and enterprises to build the future 
              without technical barriers.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {value.icon}
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Company Story */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Happy Llama was born from a simple observation: while AI was revolutionizing many industries, 
                    software development remained largely unchanged. Talented designers, product managers, and 
                    entrepreneurs were still dependent on scarce technical resources to bring their visions to life.
                  </p>
                  <p>
                    Our founders, Sarah and Marcus, experienced this firsthand. Despite having breakthrough ideas 
                    for applications, they repeatedly faced months-long development cycles, budget constraints, 
                    and the need to compromise on their vision due to technical limitations.
                  </p>
                  <p>
                    In 2023, they decided to change this. Combining Sarah&apos;s experience scaling platforms at Meta 
                    with Marcus&apos;s AI research background from OpenAI, they set out to create a new category of 
                    AI-powered development platform - one that could generate production-ready, type-safe applications 
                    from natural language descriptions.
                  </p>
                  <p>
                    Today, Happy Llama serves thousands of creators worldwide, from solo entrepreneurs to Fortune 500 
                    enterprises, all united by the desire to build amazing software without technical barriers.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <RocketLaunchIcon className="h-32 w-32 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Milestones */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to democratize software development
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.event}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact by the Numbers</h2>
            <p className="text-xl text-blue-100">
              Our growing community of builders and creators
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Active Builders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Apps Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Enterprise Pilots</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-blue-100">Team Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Join Us in Building the Future
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Whether you want to build with us, work with us, or invest in our mission, 
              we&apos;d love to hear from you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <UserGroupIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Meet the Team</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Learn more about the people behind Happy Llama
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/about/team">View Team</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BuildingOfficeIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Open Positions</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Join our mission to democratize software development
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/about/careers">View Jobs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <HeartIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Discover our vision for the future of development
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/about/mission">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}