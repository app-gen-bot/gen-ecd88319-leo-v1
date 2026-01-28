'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PrinterIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CubeIcon as CubeIconSolid,
} from '@heroicons/react/24/solid';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'patient' | 'staff' | 'inventory';
  icon: React.ElementType;
  fields?: string[];
}

const reportTemplates: ReportTemplate[] = [
  // Financial Reports
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue Report',
    description: 'Revenue breakdown by service category',
    category: 'financial',
    icon: CurrencyDollarIcon,
    fields: ['month', 'year', 'serviceCategories'],
  },
  {
    id: 'payment-summary',
    name: 'Payment Summary',
    description: 'Payment methods and outstanding balances',
    category: 'financial',
    icon: ChartPieIcon,
    fields: ['dateRange', 'paymentStatus'],
  },
  {
    id: 'insurance-claims',
    name: 'Insurance Claims Report',
    description: 'Insurance claim status and reimbursements',
    category: 'financial',
    icon: ClipboardDocumentListIcon,
    fields: ['dateRange', 'insuranceProvider', 'claimStatus'],
  },
  // Patient Analytics
  {
    id: 'patient-demographics',
    name: 'Patient Demographics',
    description: 'Age, species, and breed distribution',
    category: 'patient',
    icon: UserGroupIcon,
    fields: ['dateRange', 'species'],
  },
  {
    id: 'visit-frequency',
    name: 'Visit Frequency Analysis',
    description: 'Patient visit patterns and retention',
    category: 'patient',
    icon: CalendarIcon,
    fields: ['dateRange', 'visitType'],
  },
  {
    id: 'treatment-outcomes',
    name: 'Treatment Outcomes',
    description: 'Success rates by treatment type',
    category: 'patient',
    icon: CheckCircleIcon,
    fields: ['dateRange', 'treatmentType', 'species'],
  },
  // Staff Performance
  {
    id: 'productivity-metrics',
    name: 'Staff Productivity',
    description: 'Appointments handled and revenue generated',
    category: 'staff',
    icon: TrophyIcon,
    fields: ['dateRange', 'staffMember', 'role'],
  },
  {
    id: 'appointment-efficiency',
    name: 'Appointment Efficiency',
    description: 'Average appointment duration and wait times',
    category: 'staff',
    icon: ClockIcon,
    fields: ['dateRange', 'staffMember', 'appointmentType'],
  },
  {
    id: 'staff-utilization',
    name: 'Staff Utilization',
    description: 'Working hours and capacity analysis',
    category: 'staff',
    icon: ChartBarIcon,
    fields: ['dateRange', 'department'],
  },
  // Inventory Reports
  {
    id: 'stock-levels',
    name: 'Current Stock Levels',
    description: 'Inventory status and reorder points',
    category: 'inventory',
    icon: CubeIcon,
    fields: ['category', 'supplier', 'stockStatus'],
  },
  {
    id: 'usage-trends',
    name: 'Product Usage Trends',
    description: 'Consumption patterns and forecasting',
    category: 'inventory',
    icon: ArrowTrendingUpIcon,
    fields: ['dateRange', 'productCategory'],
  },
  {
    id: 'expiry-tracking',
    name: 'Expiry Tracking',
    description: 'Items approaching expiration dates',
    category: 'inventory',
    icon: ExclamationTriangleIcon,
    fields: ['expiryWindow', 'category'],
  },
];

// Mock data for charts
const mockChartData = {
  revenue: [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 67000 },
  ],
  patientVisits: [
    { day: 'Mon', visits: 28 },
    { day: 'Tue', visits: 32 },
    { day: 'Wed', visits: 35 },
    { day: 'Thu', visits: 30 },
    { day: 'Fri', visits: 38 },
    { day: 'Sat', visits: 22 },
  ],
  speciesDistribution: [
    { species: 'Dogs', count: 450, percentage: 45 },
    { species: 'Cats', count: 350, percentage: 35 },
    { species: 'Birds', count: 80, percentage: 8 },
    { species: 'Reptiles', count: 60, percentage: 6 },
    { species: 'Others', count: 60, percentage: 6 },
  ],
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last-30-days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('pdf');

  const handleGenerateReport = () => {
    // In a real application, this would generate the report
    // For now, we'll just show a toast notification
    toast({
      title: 'Report Generated',
      description: `${selectedTemplate} report has been generated for the selected date range.`,
    });
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // In a real application, this would export the report
    // For now, we'll just show a toast notification
    toast({
      title: 'Export Started',
      description: `Your report is being exported as ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Reports & Analytics</h1>
        <p className="text-gray-400 mt-2">
          Generate comprehensive reports and analyze practice performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-100">$67,000</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12%</span>
                </div>
              </div>
              <CurrencyDollarIconSolid className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-100">1,284</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+5%</span>
                </div>
              </div>
              <UserGroupIconSolid className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Daily Appointments</p>
                <p className="text-2xl font-bold text-gray-100">31</p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">-3%</span>
                </div>
              </div>
              <ChartBarIconSolid className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-100">456</p>
                <Badge variant="secondary" className="mt-1 bg-yellow-500/20 text-yellow-400 border-0">
                  12 Low Stock
                </Badge>
              </div>
              <CubeIconSolid className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Report Generator
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select a report template and customize parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date-range" className="text-gray-300">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="date-range" className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === 'custom' && (
              <>
                <div>
                  <Label htmlFor="start-date" className="text-gray-300">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-gray-300">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-100"
                  />
                </div>
              </>
            )}
          </div>

          <Separator className="bg-gray-700" />

          {/* Report Templates */}
          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="financial" className="data-[state=active]:bg-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="patient" className="data-[state=active]:bg-gray-600">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="staff" className="data-[state=active]:bg-gray-600">
                <TrophyIcon className="h-4 w-4 mr-2" />
                Staff
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-gray-600">
                <CubeIcon className="h-4 w-4 mr-2" />
                Inventory
              </TabsTrigger>
            </TabsList>

            {/* Financial Reports */}
            <TabsContent value="financial" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates
                  .filter((template) => template.category === 'financial')
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <template.icon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Patient Analytics */}
            <TabsContent value="patient" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates
                  .filter((template) => template.category === 'patient')
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <template.icon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Staff Performance */}
            <TabsContent value="staff" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates
                  .filter((template) => template.category === 'staff')
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <template.icon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Inventory Reports */}
            <TabsContent value="inventory" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates
                  .filter((template) => template.category === 'inventory')
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`bg-gray-700 border-gray-600 cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <template.icon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedTemplate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={!selectedTemplate}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={!selectedTemplate}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                disabled={!selectedTemplate}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Revenue Chart Placeholder</p>
                <p className="text-sm mt-1">Integration with chart library pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Distribution Chart */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2" />
              Patient Species Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ChartPieIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Pie Chart Placeholder</p>
                <p className="text-sm mt-1">Integration with chart library pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Recently Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'Monthly Revenue Report - June 2024',
                date: '2024-07-01',
                type: 'financial',
                format: 'pdf',
              },
              {
                name: 'Staff Productivity Analysis - Q2 2024',
                date: '2024-06-30',
                type: 'staff',
                format: 'excel',
              },
              {
                name: 'Patient Demographics Report',
                date: '2024-06-28',
                type: 'patient',
                format: 'pdf',
              },
              {
                name: 'Inventory Stock Levels',
                date: '2024-06-25',
                type: 'inventory',
                format: 'excel',
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-100">{report.name}</p>
                    <p className="text-xs text-gray-400">Generated on {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      report.type === 'financial'
                        ? 'bg-green-500/20 text-green-400'
                        : report.type === 'patient'
                        ? 'bg-blue-500/20 text-blue-400'
                        : report.type === 'staff'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    } border-0`}
                  >
                    {report.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-100"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}