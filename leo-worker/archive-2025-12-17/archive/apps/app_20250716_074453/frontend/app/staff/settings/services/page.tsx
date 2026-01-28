'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  active: boolean;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Annual Wellness Exam',
    category: 'Wellness',
    duration: 30,
    price: 85,
    description: 'Comprehensive annual health checkup',
    active: true,
  },
  {
    id: '2',
    name: 'Dental Cleaning',
    category: 'Dental',
    duration: 60,
    price: 300,
    description: 'Professional dental cleaning under anesthesia',
    active: true,
  },
  {
    id: '3',
    name: 'Spay/Neuter',
    category: 'Surgery',
    duration: 120,
    price: 350,
    description: 'Routine spay or neuter procedure',
    active: true,
  },
];

export default function ServicesSettingsPage() {
  const [services] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.category.toLowerCase().includes(searchLower)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Wellness: 'bg-blue-500',
      Dental: 'bg-purple-500',
      Surgery: 'bg-red-500',
      Grooming: 'bg-green-500',
      Laboratory: 'bg-yellow-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Services & Pricing</h1>
            <p className="text-gray-400">Manage your clinic's service catalog</p>
          </div>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="relative">
            <Label htmlFor="search" className="sr-only">Search</Label>
            <Input
              id="search"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-gray-100">{service.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getCategoryColor(service.category)} text-white border-0`}>
                      {service.category}
                    </Badge>
                    {service.active ? (
                      <Badge className="bg-green-500 text-white border-0">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white border-0">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3">{service.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration: <span className="text-gray-200">{service.duration} min</span></span>
                <span className="text-gray-400">Price: <span className="text-gray-200 font-semibold">${service.price}</span></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}