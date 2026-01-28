"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft,
  Save,
  Send,
  Calendar,
  Clock,
  Users,
  FileText,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Filter,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

// Report sections available
const reportSections = {
  executive: [
    { id: "key-metrics", name: "Key Metrics Overview", selected: true },
    { id: "trends", name: "Performance Trends", selected: true },
    { id: "risk-summary", name: "Risk Summary", selected: true },
    { id: "recommendations", name: "Recommendations", selected: false },
  ],
  risk: [
    { id: "risk-patterns", name: "Risk Pattern Analysis", selected: true },
    { id: "fraud-types", name: "Fraud Type Breakdown", selected: true },
    { id: "geographic", name: "Geographic Risk Map", selected: true },
    { id: "predictions", name: "Risk Predictions", selected: false },
  ],
  performance: [
    { id: "verification-metrics", name: "Verification Metrics", selected: true },
    { id: "conversion-funnel", name: "Conversion Funnel", selected: true },
    { id: "provider-performance", name: "Provider Performance", selected: true },
    { id: "benchmarking", name: "Industry Benchmarking", selected: false },
  ],
};

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get("template") || "executive";

  const [currentStep, setCurrentStep] = useState(1);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState(template);
  const [selectedSections, setSelectedSections] = useState(
    reportSections[template as keyof typeof reportSections] || reportSections.executive
  );
  const [schedule, setSchedule] = useState("one-time");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [filters, setFilters] = useState({
    dateRange: "last-30-days",
    regions: [] as string[],
    riskLevels: [] as string[],
  });

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, selected: !section.selected }
          : section
      )
    );
  };

  const handleAddRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient("");
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSaveReport = async () => {
    // Validate required fields
    if (!reportName) {
      toast.error("Please enter a report name");
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Report created successfully");
    router.push("/analytics/reports");
  };

  const handleSaveAndSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    await handleSaveReport();
    toast.success("Report sent to recipients");
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="e.g., Monthly Executive Summary"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="report-description">Description (Optional)</Label>
              <Textarea
                id="report-description"
                placeholder="Brief description of this report..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Report Type</Label>
              <RadioGroup value={reportType} onValueChange={setReportType} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="executive" id="executive" />
                  <Label htmlFor="executive" className="font-normal cursor-pointer">
                    Executive Summary - High-level overview for leadership
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="risk" id="risk" />
                  <Label htmlFor="risk" className="font-normal cursor-pointer">
                    Risk Analysis - Detailed fraud and risk patterns
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance" id="performance" />
                  <Label htmlFor="performance" className="font-normal cursor-pointer">
                    Performance Report - Verification metrics and trends
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="font-normal cursor-pointer">
                    Custom Report - Build from scratch
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Select Report Sections</h3>
              <div className="space-y-2">
                {selectedSections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={section.selected}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <Label
                      htmlFor={section.id}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {section.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Data Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                      setFilters({ ...filters, dateRange: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-quarter">Last quarter</SelectItem>
                      <SelectItem value="year-to-date">Year to date</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Regions (Optional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["North America", "Europe", "Asia Pacific", "Latin America"].map(
                      (region) => (
                        <Badge
                          key={region}
                          variant={
                            filters.regions.includes(region) ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            if (filters.regions.includes(region)) {
                              setFilters({
                                ...filters,
                                regions: filters.regions.filter((r) => r !== region),
                              });
                            } else {
                              setFilters({
                                ...filters,
                                regions: [...filters.regions, region],
                              });
                            }
                          }}
                        >
                          {region}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <Label>Risk Levels (Optional)</Label>
                  <div className="flex gap-2 mt-2">
                    {["Low", "Medium", "High"].map((level) => (
                      <Badge
                        key={level}
                        variant={
                          filters.riskLevels.includes(level) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          if (filters.riskLevels.includes(level)) {
                            setFilters({
                              ...filters,
                              riskLevels: filters.riskLevels.filter(
                                (l) => l !== level
                              ),
                            });
                          } else {
                            setFilters({
                              ...filters,
                              riskLevels: [...filters.riskLevels, level],
                            });
                          }
                        }}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Schedule</h3>
              <RadioGroup value={schedule} onValueChange={setSchedule}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="font-normal cursor-pointer">
                    One-time report
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="font-normal cursor-pointer">
                    Daily at 9:00 AM
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="font-normal cursor-pointer">
                    Weekly on Mondays at 9:00 AM
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="font-normal cursor-pointer">
                    Monthly on the 1st at 9:00 AM
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly" className="font-normal cursor-pointer">
                    Quarterly (Jan 1, Apr 1, Jul 1, Oct 1)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Recipients</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddRecipient();
                      }
                    }}
                  />
                  <Button onClick={handleAddRecipient} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {recipients.length > 0 && (
                  <div className="space-y-2">
                    {recipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-sm">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="flex items-center space-x-2">
                <Checkbox id="include-me" defaultChecked />
                <span className="font-normal cursor-pointer">
                  Include me in recipients
                </span>
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/analytics/reports">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Report</h1>
          <p className="text-muted-foreground mt-1">
            Configure your custom report settings
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex items-center ${step < 3 ? "flex-1" : ""}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Report Configuration"}
            {currentStep === 3 && "Schedule & Delivery"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Set up the basic details of your report"}
            {currentStep === 2 && "Choose what data to include in your report"}
            {currentStep === 3 && "Configure when and how to deliver the report"}
          </CardDescription>
        </CardHeader>
        <CardContent>{getStepContent()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep === 3 ? (
            <>
              <Button variant="outline" onClick={handleSaveReport}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={handleSaveAndSend}>
                <Send className="mr-2 h-4 w-4" />
                Save & Send
              </Button>
            </>
          ) : (
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}