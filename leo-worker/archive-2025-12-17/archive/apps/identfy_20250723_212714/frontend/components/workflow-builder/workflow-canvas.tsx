"use client";

import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
  NodeProps,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Fingerprint, 
  Phone, 
  Mail, 
  Monitor, 
  Shield,
  Trash2,
  Settings
} from 'lucide-react';

// Define node types based on signal types
const signalIcons = {
  document: FileText,
  biometric: Fingerprint,
  phone: Phone,
  email: Mail,
  device: Monitor,
  watchlist: Shield,
};

const signalColors = {
  document: '#3B82F6',
  biometric: '#10B981',
  phone: '#8B5CF6',
  email: '#F97316',
  device: '#6366F1',
  watchlist: '#EF4444',
};

// Custom node component
const SignalNode = ({ data, selected }: NodeProps) => {
  const Icon = signalIcons[data.signalType as keyof typeof signalIcons] || FileText;
  const color = signalColors[data.signalType as keyof typeof signalColors] || '#6B7280';

  return (
    <Card className={`p-4 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
      />
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded text-white"
              style={{ backgroundColor: color }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">{data.label}</span>
          </div>
          {data.required ? (
            <Badge variant="default" className="text-xs">Required</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Optional</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>Provider: {data.provider}</p>
          {data.details && <p>{data.details}</p>}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
      />
    </Card>
  );
};

const nodeTypes = {
  signalNode: SignalNode,
};

interface WorkflowCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
  onNodeDelete?: (nodeId: string) => void;
}

export function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onNodeDelete,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
        },
      };
      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      onEdgesChange?.(updatedEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const signalData = JSON.parse(event.dataTransfer.getData('signalData') || '{}');

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `signal-${Date.now()}`,
        type: 'signalNode',
        position,
        data: signalData,
      };

      const updatedNodes = nodes.concat(newNode);
      setNodes(updatedNodes);
      onNodesChange?.(updatedNodes);
    },
    [reactFlowInstance, nodes, setNodes, onNodesChange]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      onNodesChange?.(nodes);
    },
    [nodes, onNodesChangeInternal, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      onEdgesChange?.(edges);
    },
    [edges, onEdgesChangeInternal, onEdgesChange]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach(node => {
        onNodeDelete?.(node.id);
      });
    },
    [onNodeDelete]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#64748b', strokeWidth: 2 },
        }}
        fitView
      >
        <Background variant="dots" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => {
            const type = node.data?.signalType;
            return signalColors[type as keyof typeof signalColors] || '#6B7280';
          }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvasProvider({ children }: { children: React.ReactNode }) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}