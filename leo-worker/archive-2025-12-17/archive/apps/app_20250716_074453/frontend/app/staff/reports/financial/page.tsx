'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeftIcon, ArrowDownTrayIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Line, Bar } from 'recharts';
import { format } from 'date-fns';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 35000 },
  { month: 'Mar', revenue: 48000, expenses: 33000 },
  { month: 'Apr', revenue: 61000, expenses: 38000 },
  { month: 'May', revenue: 58000, expenses: 36000 },
  { month: 'Jun', revenue: 65000, expenses: 40000 },
];

const serviceBreakdown = [
  { service: 'Examinations', revenue: 25000, count: 320 },
  { service: 'Vaccinations', revenue: 18000, count: 450 },
  { service: 'Surgery', revenue: 35000, count: 45 },
  { service: 'Dental', revenue: 22000, count: 85 },
  { service: 'Laboratory', revenue: 15000, count: 220 },
];

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, month) => sum + month.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Financial Reports</h1>
            <p className="text-gray-400">Revenue, expenses, and financial performance</p>
          </div>
        </div>
        <Button>
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Financial Summary</SelectItem>
                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                <SelectItem value="expenses">Expense Breakdown</SelectItem>
                <SelectItem value="services">Service Performance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="date" 
              className="bg-gray-700 border-gray-600 text-gray-100"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">${totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-red-400 flex items-center mt-1">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">${netProfit.toLocaleString()}</p>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +18.7% from last period
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-100">{profitMargin}%</p>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              +2.3% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Revenue vs Expenses</CardTitle>
          <CardDescription className="text-gray-400">Monthly comparison for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            [Revenue/Expense Chart Placeholder]
          </div>
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Revenue by Service</CardTitle>
          <CardDescription className="text-gray-400">Performance breakdown by service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceBreakdown.map((service) => (
              <div key={service.service} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{service.service}</span>
                    <span className="text-sm text-gray-400">{service.count} services</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(service.revenue / 35000) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-bold text-gray-100">${service.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{((service.revenue / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}