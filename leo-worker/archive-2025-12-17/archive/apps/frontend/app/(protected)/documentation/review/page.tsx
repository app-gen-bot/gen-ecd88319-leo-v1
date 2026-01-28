'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Download,
  Save,
  Type,
  Square,
  Circle,
  ArrowUpRight,
  Highlighter,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  Loader2
} from 'lucide-react';

interface Annotation {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'highlight';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  endX?: number;
  endY?: number;
}

export default function DocumentationReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'arrow' | 'highlight'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [color, setColor] = useState('#ff0000');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load image on mount
  useEffect(() => {
    const imageUrl = searchParams.get('image');
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        drawCanvas();
      };
      img.src = imageUrl;
    }
  }, [searchParams]);

  // Redraw canvas when annotations or zoom changes
  useEffect(() => {
    drawCanvas();
  }, [annotations, zoom, image]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    const scale = zoom / 100;
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw annotations
    annotations.forEach(annotation => {
      ctx.save();
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = 2;

      switch (annotation.type) {
        case 'rectangle':
          ctx.strokeRect(
            annotation.x * scale,
            annotation.y * scale,
            (annotation.width || 0) * scale,
            (annotation.height || 0) * scale
          );
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(annotation.width || 0, 2) + Math.pow(annotation.height || 0, 2)
          ) / 2;
          ctx.beginPath();
          ctx.arc(
            annotation.x * scale,
            annotation.y * scale,
            radius * scale,
            0,
            2 * Math.PI
          );
          ctx.stroke();
          break;
        case 'arrow':
          if (annotation.endX !== undefined && annotation.endY !== undefined) {
            drawArrow(
              ctx,
              annotation.x * scale,
              annotation.y * scale,
              annotation.endX * scale,
              annotation.endY * scale
            );
          }
          break;
        case 'highlight':
          ctx.globalAlpha = 0.3;
          ctx.fillRect(
            annotation.x * scale,
            annotation.y * scale,
            (annotation.width || 0) * scale,
            (annotation.height || 0) * scale
          );
          ctx.globalAlpha = 1;
          break;
        case 'text':
          ctx.font = `${16 * scale}px Arial`;
          ctx.fillStyle = annotation.color;
          ctx.fillText(annotation.text || '', annotation.x * scale, annotation.y * scale);
          break;
      }
      ctx.restore();
    });
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (selectedTool === 'select') {
      // Check if clicking on an annotation
      const clickedAnnotation = annotations.find(ann => {
        if (ann.type === 'text') {
          return Math.abs(ann.x - x) < 50 && Math.abs(ann.y - y) < 20;
        }
        return (
          x >= ann.x &&
          x <= ann.x + (ann.width || 0) &&
          y >= ann.y &&
          y <= ann.y + (ann.height || 0)
        );
      });
      setSelectedAnnotation(clickedAnnotation || null);
    } else if (selectedTool === 'text') {
      const textAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: 'Click to edit',
        color
      };
      addAnnotation(textAnnotation);
      setSelectedAnnotation(textAnnotation);
    } else {
      setIsDrawing(true);
      setStartPos({ x, y });
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: selectedTool,
        x,
        y,
        color
      };
      setCurrentAnnotation(newAnnotation);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAnnotation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (currentAnnotation.type === 'arrow') {
      setCurrentAnnotation({
        ...currentAnnotation,
        endX: x,
        endY: y
      });
    } else {
      setCurrentAnnotation({
        ...currentAnnotation,
        width: x - startPos.x,
        height: y - startPos.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      addAnnotation(currentAnnotation);
    }
    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  const addAnnotation = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotation) {
      const newAnnotations = annotations.filter(ann => ann.id !== selectedAnnotation.id);
      setAnnotations(newAnnotations);
      setSelectedAnnotation(null);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAnnotations);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Annotations saved',
        description: 'Your annotations have been saved successfully.',
      });
      
      router.push('/documentation');
    } catch {
      toast({
        title: 'Save failed',
        description: 'Failed to save annotations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'annotated-evidence.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/documentation')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!image}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !image}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Annotation Tools</CardTitle>
            <CardDescription>Select a tool to annotate the image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={selectedTool === 'select'}
                onPressedChange={() => setSelectedTool('select')}
                className="flex-col h-16"
              >
                <Move className="h-6 w-6 mb-1" />
                <span className="text-xs">Select</span>
              </Toggle>
              <Toggle
                pressed={selectedTool === 'text'}
                onPressedChange={() => setSelectedTool('text')}
                className="flex-col h-16"
              >
                <Type className="h-6 w-6 mb-1" />
                <span className="text-xs">Text</span>
              </Toggle>
              <Toggle
                pressed={selectedTool === 'rectangle'}
                onPressedChange={() => setSelectedTool('rectangle')}
                className="flex-col h-16"
              >
                <Square className="h-6 w-6 mb-1" />
                <span className="text-xs">Rectangle</span>
              </Toggle>
              <Toggle
                pressed={selectedTool === 'circle'}
                onPressedChange={() => setSelectedTool('circle')}
                className="flex-col h-16"
              >
                <Circle className="h-6 w-6 mb-1" />
                <span className="text-xs">Circle</span>
              </Toggle>
              <Toggle
                pressed={selectedTool === 'arrow'}
                onPressedChange={() => setSelectedTool('arrow')}
                className="flex-col h-16"
              >
                <ArrowUpRight className="h-6 w-6 mb-1" />
                <span className="text-xs">Arrow</span>
              </Toggle>
              <Toggle
                pressed={selectedTool === 'highlight'}
                onPressedChange={() => setSelectedTool('highlight')}
                className="flex-col h-16"
              >
                <Highlighter className="h-6 w-6 mb-1" />
                <span className="text-xs">Highlight</span>
              </Toggle>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex === 0}
                className="flex-1"
              >
                <Undo className="h-4 w-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="flex-1"
              >
                <Redo className="h-4 w-4 mr-1" />
                Redo
              </Button>
            </div>

            {selectedAnnotation && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="text-sm font-medium">Selected Annotation</h4>
                {selectedAnnotation.type === 'text' && (
                  <Textarea
                    value={selectedAnnotation.text || ''}
                    onChange={(e) => {
                      const updated = annotations.map(ann =>
                        ann.id === selectedAnnotation.id
                          ? { ...ann, text: e.target.value }
                          : ann
                      );
                      setAnnotations(updated);
                      setSelectedAnnotation({ ...selectedAnnotation, text: e.target.value });
                    }}
                    placeholder="Enter annotation text"
                    rows={3}
                  />
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedAnnotation}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="overflow-auto max-h-[70vh] bg-muted/20 rounded-lg">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
            {!image && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No image to annotate</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/documentation')}
                >
                  Go to Documentation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}