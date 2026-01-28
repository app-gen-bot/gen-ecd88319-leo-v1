'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function InventoryReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Inventory Reports</h1>
          <p className="text-gray-400">Stock levels, usage trends, and inventory analytics</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="text-center py-12">
          <CubeIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Inventory Reports Coming Soon</h3>
          <p className="text-gray-400">Inventory analytics and reporting features are under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}