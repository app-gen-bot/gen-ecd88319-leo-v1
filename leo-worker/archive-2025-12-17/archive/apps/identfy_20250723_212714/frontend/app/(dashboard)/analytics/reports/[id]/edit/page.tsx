"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ChevronLeft,
  Save,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";

// Mock existing report data
const existingReport = {
  id: "1",
  name: "Monthly Executive Summary",
  description: "High-level overview of key metrics and trends for executive team",
  type: "executive",
  sections: [
    { id: "key-metrics", name: "Key Metrics Overview", selected: true },
    { id: "trends", name: "Performance Trends", selected: true },
    { id: "risk-summary", name: "Risk Summary", selected: true },
    { id: "recommendations", name: "Recommendations", selected: false },
  ],
  schedule: "monthly",
  recipients: ["ceo@identfy.com", "cto@identfy.com"],
  filters: {
    dateRange: "last-30-days",
    regions: ["North America", "Europe"],
    riskLevels: ["High"],
  },
};

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  
  const [reportName, setReportName] = useState(existingReport.name);
  const [reportDescription, setReportDescription] = useState(existingReport.description);
  const [reportType, setReportType] = useState(existingReport.type);
  const [selectedSections, setSelectedSections] = useState(existingReport.sections);
  const [schedule, setSchedule] = useState(existingReport.schedule);
  const [recipients, setRecipients] = useState(existingReport.recipients);
  const [newRecipient, setNewRecipient] = useState("");
  const [filters, setFilters] = useState(existingReport.filters);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    
    // Validate required fields
    if (!reportName) {
      toast.error("Please enter a report name");
      setIsSaving(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Report updated successfully");
    router.push("/analytics/reports");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/analytics/reports">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Report</h1>
            <p className="text-muted-foreground mt-1">
              Update report configuration and settings
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update the basic details of your report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="report-description">Description (Optional)</Label>
            <Textarea
              id="report-description"
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
                  Executive Summary
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="risk" id="risk" />
                <Label htmlFor="risk" className="font-normal cursor-pointer">
                  Risk Analysis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="performance" id="performance" />
                <Label htmlFor="performance" className="font-normal cursor-pointer">
                  Performance Report
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Report Sections</CardTitle>
          <CardDescription>
            Choose which sections to include in the report
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Data Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Data Filters</CardTitle>
          <CardDescription>
            Configure what data to include in the report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label>Regions</Label>
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
            <Label>Risk Levels</Label>
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
        </CardContent>
      </Card>

      {/* Schedule & Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Delivery</CardTitle>
          <CardDescription>
            Configure when and how the report is delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Schedule</Label>
            <RadioGroup value={schedule} onValueChange={setSchedule} className="mt-2">
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
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <Label>Recipients</Label>
            <div className="space-y-3 mt-2">
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
        </CardContent>
      </Card>
    </div>
  );
}