"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SparklesIcon, HeartIcon, GlobeAltIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <SparklesIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Mission
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              To democratize software development by creating AI that transforms ideas into 
              production-ready applications, empowering millions of creators worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">What We Believe</h2>
            <div className="space-y-6 text-lg">
              <p>
                Great ideas shouldn&apos;t be limited by technical barriers. Every entrepreneur, 
                designer, and visionary should have the power to bring their vision to life.
              </p>
              <p>
                We&apos;re building the future where AI amplifies human creativity, where anyone 
                can create production-grade software by describing what they want to build.
              </p>
              <p>
                Our mission is to democratize software development for millions of creators 
                worldwide, enabling innovation at unprecedented scale.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Cards */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-xl text-gray-600">
              How we&apos;re changing the world of software development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <HeartIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Human-Centered AI</h3>
                <p className="text-gray-600">
                  AI that augments human creativity rather than replacing it, 
                  making technology more accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <GlobeAltIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Global Impact</h3>
                <p className="text-gray-600">
                  Enabling millions of creators worldwide to build software 
                  that solves real problems in their communities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <RocketLaunchIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Innovation Acceleration</h3>
                <p className="text-gray-600">
                  Reducing the time from idea to deployment from months to hours, 
                  accelerating innovation across industries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-xl text-blue-100 mb-8">
              Help us democratize software development for creators worldwide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/beta-signup">Start Building</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/about/careers">Join Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}