"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Node, Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Play,
  History,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { WorkflowCanvasProvider, WorkflowCanvas } from "@/components/workflow-builder/workflow-canvas";
import { SignalLibrary } from "@/components/workflow-builder/signal-library";
import { SignalProperties } from "@/components/workflow-builder/signal-properties";
import { TestWorkflowModal } from "@/components/workflow-builder/test-workflow-modal";

// Convert old workflow data to React Flow format
const mockWorkflow = {
  id: "1",
  name: "Customer Onboarding",
  description: "Standard KYC workflow for new customers",
  version: "v2.1",
};

// Initial nodes for the workflow
const initialNodes: Node[] = [
  {
    id: 'signal-1',
    type: 'signalNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Document Verification',
      signalType: 'document',
      provider: 'Jumio',
      required: true,
      settings: {
        documentTypes: ['passport', 'drivers_license'],
        extractData: true,
        checkExpiry: true,
        minimumQuality: 85,
      },
      details: 'Types: passport, drivers_license',
    },
  },
  {
    id: 'signal-2',
    type: 'signalNode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Biometric Check',
      signalType: 'biometric',
      provider: 'iProov',
      required: true,
      settings: {
        livenessCheck: true,
        matchThreshold: 98,
        maxAttempts: 3,
      },
      details: 'Threshold: 98%',
    },
  },
  {
    id: 'signal-3',
    type: 'signalNode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Watchlist Screening',
      signalType: 'watchlist',
      provider: 'ComplyAdvantage',
      required: false,
      settings: {
        lists: ['sanctions', 'pep'],
        fuzzyMatching: true,
        matchThreshold: 90,
      },
      details: 'Lists: sanctions, pep',
    },
  },
];

// Initial edges (connections)
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'signal-1',
    target: 'signal-2',
    animated: true,
  },
  {
    id: 'e2-3',
    source: 'signal-2',
    target: 'signal-3',
    animated: true,
  },
];

export default function WorkflowEditPage() {
  const params = useParams();
  const router = useRouter();
  
  const [workflow, setWorkflow] = useState(mockWorkflow);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes);
  }, []);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
  }, []);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Update the details based on settings
          let details = '';
          if (data.signalType === 'document' && data.settings?.documentTypes) {
            details = `Types: ${data.settings.documentTypes.join(', ')}`;
          } else if (data.signalType === 'biometric' && data.settings?.matchThreshold) {
            details = `Threshold: ${data.settings.matchThreshold}%`;
          } else if (data.signalType === 'watchlist' && data.settings?.lists) {
            details = `Lists: ${data.settings.lists.join(', ')}`;
          }

          return {
            ...node,
            data: {
              ...data,
              details,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
    toast.success("Signal removed");
  }, []);

  const saveWorkflow = async () => {
    setIsSaving(true);
    // Convert React Flow data back to your backend format
    const workflowData = {
      ...workflow,
      nodes,
      edges,
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    toast.success("Workflow saved successfully");
  };

  const publishWorkflow = async () => {
    setIsPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPublishing(false);
    toast.success("Workflow published and activated");
  };

  return (
    <WorkflowCanvasProvider>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/workflows">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    value={workflow.name}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold border-none p-0 h-auto"
                  />
                  <Badge variant="secondary">{workflow.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workflows/${params.id}/versions`}>
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTestModal(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Test Workflow
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={saveWorkflow}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button 
                size="sm"
                onClick={publishWorkflow}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Signal Library */}
          <div className="w-64 border-r">
            <SignalLibrary />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={handleNodeSelect}
              onNodeDelete={handleNodeDelete}
            />
          </div>

          {/* Right Panel - Properties */}
          {selectedNode && (
            <div className="w-80 border-l">
              <SignalProperties
                selectedNode={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={handleNodeUpdate}
                onDelete={handleNodeDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Test Workflow Modal */}
      <TestWorkflowModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        workflowName={workflow.name}
        workflowId={workflow.id}
        signals={nodes.map(node => ({
          id: node.id,
          name: node.data.label,
          type: node.data.signalType,
          required: node.data.required || false,
          provider: node.data.provider || 'Default',
        }))}
      />
    </WorkflowCanvasProvider>
  );
}