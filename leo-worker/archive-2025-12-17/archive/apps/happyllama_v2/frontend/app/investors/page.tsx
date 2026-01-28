'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowUpIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowDownIcon,
  LinkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function InvestorsPage() {
  const [selectedMetric, setSelectedMetric] = useState<'users' | 'revenue' | 'projects'>('users');
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y' | 'All'>('6M');
  const [isInvestorFormOpen, setIsInvestorFormOpen] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    tam: 0,
    users: 0,
    pilots: 0,
    growth: 0
  });

  const [investorForm, setInvestorForm] = useState({
    name: '',
    email: '',
    firm: '',
    linkedIn: '',
    investmentFocus: [] as string[],
    stage: [] as string[],
    message: ''
  });

  // Animate numbers on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedNumbers({
        tam: 100,
        users: 5000,
        pilots: 50,
        growth: 15
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const keyMetrics = [
    { name: 'TAM', value: `$${animatedNumbers.tam}B+`, description: 'Total Addressable Market', trend: '+12%' },
    { name: 'Beta Users', value: `${animatedNumbers.users.toLocaleString()}+`, description: 'Active in beta program', trend: '+25%' },
    { name: 'Enterprise Pilots', value: `${animatedNumbers.pilots}+`, description: 'Fortune 1000 trials', trend: '+30%' },
    { name: 'MoM Growth', value: `${animatedNumbers.growth}%`, description: 'Monthly user growth', trend: '+5%' }
  ];

  const tractionMetrics = {
    users: {
      total: 5234,
      active: 4891,
      growth: 15.3,
      data: [1200, 1800, 2400, 3100, 4200, 5234]
    },
    revenue: {
      mrr: 125000,
      arr: 1500000,
      growth: 22.7,
      data: [45000, 67000, 89000, 98000, 115000, 125000]
    },
    projects: {
      created: 12834,
      deployed: 9234,
      success: 87.2,
      data: [3200, 5100, 7200, 8900, 11200, 12834]
    }
  };

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'Former VP Engineering at Meta, led AI platform serving 3B+ users. Stanford CS, 15 years building scalable systems.',
      linkedin: 'https://linkedin.com/in/sarah-chen',
      image: '/images/team/sarah-chen.jpg'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Co-Founder & CTO',
      bio: 'Ex-OpenAI research scientist, published 25+ papers on LLMs. MIT PhD, pioneered multi-agent architectures.',
      linkedin: 'https://linkedin.com/in/marcus-rodriguez',
      image: '/images/team/marcus-rodriguez.jpg'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI Research',
      bio: 'Former Google Brain researcher, expert in hierarchical learning systems. Berkeley PhD, 20+ patents.',
      linkedin: 'https://linkedin.com/in/emily-watson',
      image: '/images/team/emily-watson.jpg'
    }
  ];

  const advisors = [
    { name: 'Reid Hoffman', company: 'Greylock Partners', expertise: 'Scaling platforms' },
    { name: 'Dr. Fei-Fei Li', company: 'Stanford HAI', expertise: 'AI research & ethics' },
    { name: 'Satya Nadella', company: 'Microsoft', expertise: 'Enterprise transformation' },
    { name: 'Jensen Huang', company: 'NVIDIA', expertise: 'AI infrastructure' }
  ];

  const fundingHistory = [
    { round: 'Pre-Seed', date: '2023-06', amount: '$2.5M', lead: 'Founders Fund', valuation: '$15M' },
    { round: 'Seed', date: '2024-02', amount: '$8M', lead: 'Andreessen Horowitz', valuation: '$45M' },
    { round: 'Series A', date: '2024-08', amount: '$25M', lead: 'Sequoia Capital', valuation: '$150M' },
    { round: 'Series B', date: 'Current', amount: '$60M', lead: 'TBD', valuation: '$400M+' }
  ];

  const competitiveAdvantages = [
    {
      icon: <LightBulbIcon className="h-8 w-8 text-yellow-600" />,
      title: 'Hierarchical Learning',
      description: 'Proprietary memory architecture that learns from every interaction',
      moat: 'Patent-pending, 3+ years R&D lead'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-green-600" />,
      title: 'Type-Safe Generation',
      description: 'Only platform generating production-grade, type-safe code at scale',
      moat: 'Technical complexity barrier'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-blue-600" />,
      title: 'Multi-Agent Orchestra',
      description: 'Coordinated AI agents specializing in different aspects of development',
      moat: 'Network effects, data flywheel'
    },
    {
      icon: <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />,
      title: 'Enterprise DNA',
      description: 'Built for enterprise from day one with governance and compliance',
      moat: 'First-mover advantage in regulated industries'
    }
  ];

  const pressCoverage = [
    { outlet: 'TechCrunch', title: 'Happy Llama raises $25M to democratize app development', date: '2024-08-15' },
    { outlet: 'Forbes', title: 'The AI startup that could replace low-code platforms', date: '2024-07-22' },
    { outlet: 'The Information', title: 'Enterprise demand drives AI development tool boom', date: '2024-09-03' },
    { outlet: 'MIT Tech Review', title: 'Multi-agent systems: The future of software creation', date: '2024-08-28' }
  ];

  const handleInvestorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Investor form submitted:', investorForm);
    setIsInvestorFormOpen(false);
    alert('Thank you for your interest. Our team will be in touch within 24 hours.');
    // Reset form
    setInvestorForm({
      name: '',
      email: '',
      firm: '',
      linkedIn: '',
      investmentFocus: [],
      stage: [],
      message: ''
    });
  };

  const toggleArrayField = (field: 'investmentFocus' | 'stage', value: string) => {
    setInvestorForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-600 to-purple-600 opacity-10"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Investing in the Future of Software Development
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Happy Llama is democratizing application development with production-grade AI, 
              targeting a $100B+ market opportunity
            </p>
            
            {/* Key Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{metric.description}</div>
                  <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                    <ArrowUpIcon className="h-3 w-3" />
                    {metric.trend}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={() => setIsInvestorFormOpen(true)}
              >
                Schedule Meeting with Founders
                <CalendarDaysIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Request Investment Deck
                <ArrowDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Massive Market Opportunity
            </h2>
            <p className="text-xl text-gray-600">
              Positioned at the intersection of three massive, growing markets
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* TAM Visualization - Concentric Circles */}
              <div className="flex items-center justify-center h-96">
                <div className="relative">
                  {/* Outer circle - Traditional Dev */}
                  <div className="w-80 h-80 rounded-full bg-blue-100 flex items-center justify-center relative">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="text-lg font-bold text-blue-800">Traditional Dev</div>
                      <div className="text-sm text-blue-600">$200B Market</div>
                    </div>
                    
                    {/* Middle circle - AI Development */}
                    <div className="w-56 h-56 rounded-full bg-purple-100 flex items-center justify-center relative">
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-md font-bold text-purple-800">AI Development</div>
                        <div className="text-sm text-purple-600">$40B Market</div>
                      </div>
                      
                      {/* Inner circle - Low/No Code */}
                      <div className="w-32 h-32 rounded-full bg-green-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-800">Low/No Code</div>
                          <div className="text-xs text-green-600">$30B Market</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Happy Llama position */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="text-sm font-bold text-red-600">Happy Llama</div>
                      <div className="text-xs text-gray-600">Perfect positioning</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button variant="outline">
                  View Market Analysis
                  <ArrowDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traction Metrics */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Strong Traction Metrics
            </h2>
            <p className="text-xl text-gray-600">
              Consistent growth across all key metrics
            </p>
          </div>

          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Growth Dashboard</CardTitle>
                
                <div className="flex gap-2">
                  <div className="flex bg-gray-100 p-1 rounded">
                    {(['users', 'revenue', 'projects'] as const).map((metric) => (
                      <button
                        key={metric}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          selectedMetric === metric
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => setSelectedMetric(metric)}
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex bg-gray-100 p-1 rounded">
                    {(['3M', '6M', '1Y', 'All'] as const).map((range) => (
                      <button
                        key={range}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          timeRange === range
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => setTimeRange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Key Stats */}
                <div className="space-y-4">
                  {selectedMetric === 'users' && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {tractionMetrics.users.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-800">Total Users</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {tractionMetrics.users.active.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-800">Active Users</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {tractionMetrics.users.growth}%
                        </div>
                        <div className="text-sm text-purple-800">Growth Rate</div>
                      </div>
                    </>
                  )}
                  
                  {selectedMetric === 'revenue' && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${tractionMetrics.revenue.mrr.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-800">Monthly Recurring Revenue</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${tractionMetrics.revenue.arr.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-800">Annual Recurring Revenue</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {tractionMetrics.revenue.growth}%
                        </div>
                        <div className="text-sm text-purple-800">Growth Rate</div>
                      </div>
                    </>
                  )}
                  
                  {selectedMetric === 'projects' && (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {tractionMetrics.projects.created.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-800">Projects Created</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {tractionMetrics.projects.deployed.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-800">Successfully Deployed</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {tractionMetrics.projects.success}%
                        </div>
                        <div className="text-sm text-purple-800">Success Rate</div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Chart Visualization */}
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                    {tractionMetrics[selectedMetric].data.map((value, index) => {
                      const height = (value / Math.max(...tractionMetrics[selectedMetric].data)) * 200;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-600 rounded-t transition-all duration-500 ease-out w-8"
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-2">
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="ghost" size="sm">
                      Export Data
                      <ArrowDownIcon className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technology Moat */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Defensible Technology Moat
            </h2>
            <p className="text-xl text-gray-600">
              Multiple layers of competitive advantages and intellectual property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            {competitiveAdvantages.map((advantage, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {advantage.icon}
                    <div>
                      <CardTitle className="text-lg">{advantage.title}</CardTitle>
                      <CardDescription>{advantage.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="text-sm font-medium text-amber-800 mb-1">Competitive Moat</div>
                    <div className="text-sm text-amber-700">{advantage.moat}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline">
              View Technology Deep Dive
              <DocumentTextIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              World-Class Team
            </h2>
            <p className="text-xl text-gray-600">
              Led by experienced founders with deep AI and enterprise expertise
            </p>
          </div>

          {/* Founders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    LinkedIn
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Advisors */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-center mb-6">Strategic Advisors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {advisors.map((advisor, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <UserGroupIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="font-medium text-sm">{advisor.name}</div>
                  <div className="text-xs text-gray-600 mb-1">{advisor.company}</div>
                  <div className="text-xs text-blue-600">{advisor.expertise}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline">
              <UserGroupIcon className="mr-2 h-4 w-4" />
              Join Our Team
            </Button>
          </div>
        </div>
      </div>

      {/* Funding History */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funding History
            </h2>
            <p className="text-xl text-gray-600">
              Backed by top-tier investors with strong enterprise networks
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {fundingHistory.map((round, index) => (
                <Card key={index} className={`${round.round === 'Series B' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={round.round === 'Series B' ? 'default' : 'secondary'}>
                            {round.round}
                          </Badge>
                          <span className="text-sm text-gray-600">{round.date}</span>
                        </div>
                        <div className="font-medium">Lead: {round.lead}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{round.amount}</div>
                        <div className="text-sm text-gray-600">Valuation: {round.valuation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Round */}
            <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  Series B - Current Round
                </CardTitle>
                <CardDescription>
                  Raising $60M to accelerate enterprise growth and expand AI capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Use of Funds</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>• Enterprise sales & marketing</span>
                        <span className="text-blue-600">40%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>• R&D and AI capabilities</span>
                        <span className="text-blue-600">35%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>• International expansion</span>
                        <span className="text-blue-600">15%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>• Strategic partnerships</span>
                        <span className="text-blue-600">10%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Key Milestones</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• $10M ARR by end of 2025</li>
                      <li>• 50+ Fortune 500 customers</li>
                      <li>• International market entry (EU)</li>
                      <li>• Advanced AI model releases</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setIsInvestorFormOpen(true)}>
                    Express Interest
                  </Button>
                  <Button variant="outline">
                    Request Term Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Press Coverage */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Press & Recognition
            </h2>
            <p className="text-xl text-gray-600">
              Industry recognition and media coverage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {pressCoverage.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-600 text-sm mb-1">{article.outlet}</div>
                      <h3 className="font-medium text-gray-900 mb-2">{article.title}</h3>
                      <div className="text-sm text-gray-500">{article.date}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline">
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              Download Press Kit
            </Button>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Us in Revolutionizing Software Development
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Partner with Happy Llama as we transform how the world builds software
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setIsInvestorFormOpen(true)}
              className="px-8"
            >
              Schedule Founder Meeting
              <CalendarDaysIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Request Investment Deck
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Investor Form Modal */}
      <Dialog open={isInvestorFormOpen} onOpenChange={setIsInvestorFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Investor Information</DialogTitle>
            <DialogDescription>
              Please provide your details to schedule a meeting with our founders
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInvestorSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  required
                  value={investorForm.name}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={investorForm.email}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@venture.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Firm Name *</label>
                <Input
                  required
                  value={investorForm.firm}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, firm: e.target.value }))}
                  placeholder="Sequoia Capital"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile *</label>
                <Input
                  type="url"
                  required
                  value={investorForm.linkedIn}
                  onChange={(e) => setInvestorForm(prev => ({ ...prev, linkedIn: e.target.value }))}
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Investment Focus *</label>
              <div className="grid grid-cols-2 gap-2">
                {['AI/ML', 'Developer Tools', 'Enterprise Software', 'No-Code/Low-Code', 'SaaS', 'Other'].map(focus => (
                  <label key={focus} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={investorForm.investmentFocus.includes(focus)}
                      onChange={() => toggleArrayField('investmentFocus', focus)}
                      className="rounded border-gray-300"
                    />
                    <span>{focus}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Investment Stage *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Pre-Seed', 'Seed', 'Series A', 'Series B+'].map(stage => (
                  <label key={stage} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={investorForm.stage.includes(stage)}
                      onChange={() => toggleArrayField('stage', stage)}
                      className="rounded border-gray-300"
                    />
                    <span>{stage}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea
                value={investorForm.message}
                onChange={(e) => setInvestorForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your investment thesis and interest in Happy Llama..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit & Schedule Meeting
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsInvestorFormOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}