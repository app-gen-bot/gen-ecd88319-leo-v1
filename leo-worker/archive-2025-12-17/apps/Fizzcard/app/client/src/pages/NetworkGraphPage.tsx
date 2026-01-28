import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Network, ZoomIn, ZoomOut, Maximize2, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import type { NetworkNode, NetworkLink } from '@shared/contracts/network.contract';

// Extended node type for graph rendering
interface GraphNode extends NetworkNode {
  x?: number;
  y?: number;
}

// Extended link type for graph rendering
interface GraphLink extends NetworkLink {
  source: number | GraphNode;
  target: number | GraphNode;
}

/**
 * NetworkGraphPage component
 * Visualize professional network with force-directed graph
 */
export default function NetworkGraphPage() {
  const { user } = useAuth();
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>();
  const [depth, setDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<NetworkLink | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<number>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());

  // Fetch graph data
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['network-graph', depth],
    queryFn: async () => {
      const response = await apiClient.network.getGraph({
        query: { depth },
      });
      if (response.status !== 200) throw new Error('Failed to fetch graph data');
      return response.body;
    },
  });

  // Fetch current user's stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['network-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await apiClient.network.getStats({
        params: { userId: user.id },
      });
      if (response.status !== 200) throw new Error('Failed to fetch stats');
      return response.body;
    },
    enabled: !!user,
  });

  // Fetch super connectors
  const { data: superConnectors, isLoading: connectorsLoading } = useQuery({
    queryKey: ['super-connectors'],
    queryFn: async () => {
      const response = await apiClient.network.getSuperConnectors({
        query: { limit: 10 },
      });
      if (response.status !== 200) throw new Error('Failed to fetch super connectors');
      return response.body;
    },
  });

  // Handle node click
  const handleNodeClick = useCallback((node: NetworkNode) => {
    setSelectedNode(node);

    // Highlight connected nodes
    if (graphData) {
      const connectedNodes = new Set<number>();
      const connectedLinks = new Set<string>();

      graphData.links.forEach((link) => {
        if (link.source === node.id) {
          connectedNodes.add(link.target);
          connectedLinks.add(`${link.source}-${link.target}`);
        } else if (link.target === node.id) {
          connectedNodes.add(link.source);
          connectedLinks.add(`${link.source}-${link.target}`);
        }
      });

      setHighlightNodes(connectedNodes);
      setHighlightLinks(connectedLinks);
    }
  }, [graphData]);

  // Handle node hover
  const handleNodeHover = useCallback((node: NetworkNode | null) => {
    // Can be used for additional hover effects
    if (node) {
      // Future enhancement: show tooltip or additional info
    }
  }, []);

  // Handle link hover
  const handleLinkHover = useCallback((link: NetworkLink | null) => {
    setHoveredLink(link);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.2, 400);
    }
  };

  const handleCenterGraph = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  // Node canvas rendering
  const nodeCanvasObject = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label || '';
    const fontSize = 12 / globalScale;
    const nodeSize = 5 + (node.connectionCount || 0) * 0.5;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = node.isVerified ? '#06b6d4' : '#a855f7';

    // Highlight if selected or connected
    if (selectedNode?.id === node.id) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = node.isVerified ? '#06b6d4' : '#a855f7';
    } else if (highlightNodes.has(node.id)) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = node.isVerified ? '#06b6d4' : '#a855f7';
    }

    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw border for verified users
    if (node.isVerified) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    // Draw initials
    const initials = getInitials(label);
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(initials, node.x || 0, node.y || 0);

    // Draw label below node when zoomed in
    if (globalScale > 1) {
      ctx.font = `${fontSize * 0.8}px Sans-Serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText(label, node.x || 0, (node.y || 0) + nodeSize + fontSize);
    }
  }, [selectedNode, highlightNodes]);

  // Link styling
  const getLinkColor = useCallback((link: GraphLink) => {
    const sourceId = typeof link.source === 'number' ? link.source : link.source.id;
    const targetId = typeof link.target === 'number' ? link.target : link.target.id;
    const linkId = `${sourceId}-${targetId}`;
    if (highlightLinks.has(linkId)) {
      return 'rgba(6, 182, 212, 0.6)';
    }
    return 'rgba(255, 255, 255, 0.15)';
  }, [highlightLinks]);

  const getLinkWidth = useCallback((link: GraphLink) => {
    const baseWidth = (link.strength || 1) * 0.5;
    const sourceId = typeof link.source === 'number' ? link.source : link.source.id;
    const targetId = typeof link.target === 'number' ? link.target : link.target.id;
    const linkId = `${sourceId}-${targetId}`;
    if (highlightLinks.has(linkId)) {
      return baseWidth * 2;
    }
    return baseWidth;
  }, [highlightLinks]);

  const isLoading = graphLoading || statsLoading || connectorsLoading;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Network className="w-8 h-8 text-primary-500" />
              Network Graph
            </h1>
            <p className="text-text-secondary mt-2">
              Visualize and explore your professional network
            </p>
          </div>

          {/* Depth Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-secondary">
              Depth:
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="px-4 py-2 bg-background-glass border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
            >
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
              <span className="text-text-secondary">Verified User</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span className="text-text-secondary">Regular User</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <div className="w-5 h-5 rounded-full bg-purple-500"></div>
              </div>
              <span className="text-text-secondary">Size = Connection Count</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 items-center">
                <div className="w-8 h-0.5 bg-white/20"></div>
                <div className="w-8 h-1 bg-white/20"></div>
                <div className="w-8 h-1.5 bg-white/20"></div>
              </div>
              <span className="text-text-secondary">Thickness = Connection Strength</span>
            </div>
          </div>
        </GlassCard>

        {/* Main Graph Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-2">
            <GlassCard className="overflow-hidden relative">
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="bg-background-glass/50 backdrop-blur-sm hover:bg-background-glass"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="bg-background-glass/50 backdrop-blur-sm hover:bg-background-glass"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCenterGraph}
                  className="bg-background-glass/50 backdrop-blur-sm hover:bg-background-glass"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Hover Info */}
              {hoveredLink && hoveredLink.note && (
                <div className="absolute top-4 left-4 z-10 max-w-xs">
                  <GlassCard className="p-3">
                    <p className="text-sm text-text-secondary">{hoveredLink.note}</p>
                  </GlassCard>
                </div>
              )}

              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading network graph...</p>
                  </div>
                </div>
              ) : graphData ? (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={800}
                  height={600}
                  backgroundColor="#0a0a0a"
                  nodeLabel="label"
                  nodeVal={(node: GraphNode) => 5 + (node.connectionCount || 0) * 0.5}
                  nodeCanvasObject={nodeCanvasObject}
                  linkColor={getLinkColor}
                  linkWidth={getLinkWidth}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleWidth={(link: GraphLink) => {
                    const sourceId = typeof link.source === 'number' ? link.source : link.source.id;
                    const targetId = typeof link.target === 'number' ? link.target : link.target.id;
                    return highlightLinks.has(`${sourceId}-${targetId}`) ? 2 : 0;
                  }}
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  onLinkHover={handleLinkHover}
                  cooldownTicks={100}
                  onEngineStop={() => {
                    if (graphRef.current) {
                      graphRef.current.zoomToFit(400, 50);
                    }
                  }}
                />
              ) : (
                <div className="h-[600px] flex items-center justify-center">
                  <p className="text-text-secondary">No graph data available</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Network Stats */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                Your Network Stats
              </h3>
              {statsLoading ? (
                <SkeletonCard />
              ) : stats ? (
                <dl className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border-default">
                    <dt className="text-text-secondary text-sm">Direct Connections</dt>
                    <dd className="font-bold text-2xl text-primary-500">{stats.directConnections}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border-default">
                    <dt className="text-text-secondary text-sm">2nd Degree</dt>
                    <dd className="font-bold text-xl text-accent-500">{stats.secondDegreeConnections}</dd>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border-default">
                    <dt className="text-text-secondary text-sm">Total Network</dt>
                    <dd className="font-semibold text-lg">{stats.networkSize}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-text-secondary text-sm">Clustering</dt>
                    <dd className="font-semibold">{stats.clusteringCoefficient.toFixed(3)}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-text-secondary text-sm">Avg Path Length</dt>
                    <dd className="font-semibold">{stats.averagePathLength.toFixed(2)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-text-secondary text-sm">Stats unavailable</p>
              )}
            </GlassCard>

            {/* Selected Node Details */}
            {selectedNode && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Selected Node</h3>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar
                    src={undefined}
                    alt={selectedNode.label}
                    size="md"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{selectedNode.label}</h4>
                    <p className="text-text-secondary text-sm mb-2">{selectedNode.email}</p>
                    {selectedNode.title && (
                      <p className="text-text-secondary text-xs mb-1">
                        {selectedNode.title}
                        {selectedNode.company && ` at ${selectedNode.company}`}
                      </p>
                    )}
                    {selectedNode.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-500 rounded text-xs font-medium mt-2">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-default">
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Connections</p>
                    <p className="font-semibold">{selectedNode.connectionCount}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">FizzCoins</p>
                    <p className="font-semibold text-fizzCoin-500">{selectedNode.fizzCoins}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedNode(null);
                    setHighlightNodes(new Set());
                    setHighlightLinks(new Set());
                  }}
                  className="w-full mt-4"
                >
                  Clear Selection
                </Button>
              </GlassCard>
            )}

            {/* Super Connectors */}
            {superConnectors && superConnectors.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Super Connectors</h3>
                <div className="space-y-3">
                  {superConnectors.slice(0, 5).map((connector, index) => (
                    <div
                      key={connector.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => {
                        const node = graphData?.nodes.find(n => n.id === connector.id);
                        if (node) handleNodeClick(node);
                      }}
                    >
                      <span className="text-text-secondary text-sm font-medium w-6">
                        #{index + 1}
                      </span>
                      <Avatar
                        src={connector.avatarUrl || undefined}
                        alt={connector.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{connector.name}</p>
                        <p className="text-text-secondary text-xs">
                          {connector.connectionCount} connections
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Graph Info */}
        {graphData && (
          <GlassCard className="p-4">
            <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
              <span>{graphData.nodes.length} nodes</span>
              <span>•</span>
              <span>{graphData.links.length} connections</span>
              <span>•</span>
              <span>Depth: {depth} {depth === 1 ? 'degree' : 'degrees'}</span>
            </div>
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
