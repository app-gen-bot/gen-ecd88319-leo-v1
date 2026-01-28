'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentTextIcon, DocumentArrowUpIcon, FolderIcon, ClipboardDocumentListIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Documents</h1>
          <p className="text-gray-400">Manage forms, protocols, and compliance documents</p>
        </div>
        <Button>
          <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-gray-100">New Patient Form</CardTitle>
                    <CardDescription className="text-gray-400">Client information intake</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Updated 2 days ago</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-gray-100">Consent Form</CardTitle>
                    <CardDescription className="text-gray-400">Treatment authorization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Updated 1 week ago</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <DocumentTextIcon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-gray-100">Post-Op Instructions</CardTitle>
                    <CardDescription className="text-gray-400">Surgery aftercare guide</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Updated 3 weeks ago</span>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="protocols">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Protocol Documents</h3>
              <p className="text-gray-400">Medical protocols and standard operating procedures</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <ShieldCheckIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Compliance Documents</h3>
              <p className="text-gray-400">Regulatory compliance and certification documents</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}