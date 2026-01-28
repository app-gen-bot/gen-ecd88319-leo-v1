"use client";

import React from 'react';
import { Node } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Trash2 } from 'lucide-react';
import { signalTypes } from './signal-library';

interface SignalPropertiesProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
}

export function SignalProperties({ 
  selectedNode, 
  onClose, 
  onUpdate, 
  onDelete 
}: SignalPropertiesProps) {
  if (!selectedNode) return null;

  const signalType = selectedNode.data.signalType;
  const signalConfig = signalTypes[signalType as keyof typeof signalTypes];
  
  if (!signalConfig) return null;

  const handleProviderChange = (provider: string) => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      provider,
    });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      required,
    });
  };

  const handleSettingsChange = (key: string, value: any) => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      settings: {
        ...selectedNode.data.settings,
        [key]: value,
      },
    });
  };

  const renderSignalSettings = () => {
    switch (signalType) {
      case 'document':
        return (
          <>
            <div>
              <Label>Accepted Document Types</Label>
              <div className="space-y-2 mt-2">
                {["passport", "drivers_license", "national_id"].map(docType => (
                  <div key={docType} className="flex items-center space-x-2">
                    <Checkbox
                      id={docType}
                      checked={selectedNode.data.settings?.documentTypes?.includes(docType)}
                      onCheckedChange={(checked) => {
                        const currentTypes = selectedNode.data.settings?.documentTypes || [];
                        const newTypes = checked 
                          ? [...currentTypes, docType]
                          : currentTypes.filter((t: string) => t !== docType);
                        handleSettingsChange('documentTypes', newTypes);
                      }}
                    />
                    <Label htmlFor={docType} className="text-sm font-normal cursor-pointer">
                      {docType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Minimum Quality Score</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[selectedNode.data.settings?.minimumQuality || 80]}
                  onValueChange={(value) => handleSettingsChange('minimumQuality', value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">
                  {selectedNode.data.settings?.minimumQuality || 80}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="extract-data">Extract Document Data</Label>
              <Switch
                id="extract-data"
                checked={selectedNode.data.settings?.extractData ?? true}
                onCheckedChange={(checked) => handleSettingsChange('extractData', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="check-expiry">Check Document Expiry</Label>
              <Switch
                id="check-expiry"
                checked={selectedNode.data.settings?.checkExpiry ?? true}
                onCheckedChange={(checked) => handleSettingsChange('checkExpiry', checked)}
              />
            </div>
          </>
        );

      case 'biometric':
        return (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="liveness">Liveness Check</Label>
              <Switch
                id="liveness"
                checked={selectedNode.data.settings?.livenessCheck ?? true}
                onCheckedChange={(checked) => handleSettingsChange('livenessCheck', checked)}
              />
            </div>

            <div>
              <Label>Match Threshold</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[selectedNode.data.settings?.matchThreshold || 95]}
                  onValueChange={(value) => handleSettingsChange('matchThreshold', value[0])}
                  min={80}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">
                  {selectedNode.data.settings?.matchThreshold || 95}%
                </span>
              </div>
            </div>

            <div>
              <Label>Max Attempts</Label>
              <Select
                value={String(selectedNode.data.settings?.maxAttempts || 3)}
                onValueChange={(value) => handleSettingsChange('maxAttempts', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? 'attempt' : 'attempts'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'phone':
        return (
          <>
            <div>
              <Label>Verification Methods</Label>
              <div className="space-y-2 mt-2">
                {["sms", "voice", "whatsapp"].map(method => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={selectedNode.data.settings?.verificationMethod?.includes(method)}
                      onCheckedChange={(checked) => {
                        const currentMethods = selectedNode.data.settings?.verificationMethod || [];
                        const newMethods = checked 
                          ? [...currentMethods, method]
                          : currentMethods.filter((m: string) => m !== method);
                        handleSettingsChange('verificationMethod', newMethods);
                      }}
                    />
                    <Label htmlFor={method} className="text-sm font-normal cursor-pointer">
                      {method.toUpperCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Code Length</Label>
              <Select
                value={String(selectedNode.data.settings?.codeLength || 6)}
                onValueChange={(value) => handleSettingsChange('codeLength', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={String(num)}>
                      {num} digits
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Code Expiry (minutes)</Label>
              <Select
                value={String(selectedNode.data.settings?.expiryMinutes || 10)}
                onValueChange={(value) => handleSettingsChange('expiryMinutes', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 30, 60].map(num => (
                    <SelectItem key={num} value={String(num)}>
                      {num} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'watchlist':
        return (
          <>
            <div>
              <Label>Screening Lists</Label>
              <div className="space-y-2 mt-2">
                {["sanctions", "pep", "adverse_media"].map(list => (
                  <div key={list} className="flex items-center space-x-2">
                    <Checkbox
                      id={list}
                      checked={selectedNode.data.settings?.lists?.includes(list)}
                      onCheckedChange={(checked) => {
                        const currentLists = selectedNode.data.settings?.lists || [];
                        const newLists = checked 
                          ? [...currentLists, list]
                          : currentLists.filter((l: string) => l !== list);
                        handleSettingsChange('lists', newLists);
                      }}
                    />
                    <Label htmlFor={list} className="text-sm font-normal cursor-pointer">
                      {list.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="fuzzy-matching">Fuzzy Matching</Label>
              <Switch
                id="fuzzy-matching"
                checked={selectedNode.data.settings?.fuzzyMatching ?? true}
                onCheckedChange={(checked) => handleSettingsChange('fuzzyMatching', checked)}
              />
            </div>

            <div>
              <Label>Match Threshold</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[selectedNode.data.settings?.matchThreshold || 85]}
                  onValueChange={(value) => handleSettingsChange('matchThreshold', value[0])}
                  min={70}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">
                  {selectedNode.data.settings?.matchThreshold || 85}%
                </span>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Signal Properties</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Signal Type */}
        <div>
          <Label className="text-xs text-muted-foreground">Signal Type</Label>
          <p className="font-medium">{signalConfig.name}</p>
        </div>

        {/* Provider Selection */}
        <div>
          <Label>Provider</Label>
          <Select
            value={selectedNode.data.provider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {signalConfig.providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="required">Required Signal</Label>
          <Switch
            id="required"
            checked={selectedNode.data.required}
            onCheckedChange={handleRequiredChange}
          />
        </div>

        {/* Signal-specific settings */}
        {renderSignalSettings()}

        {/* Delete Signal */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(selectedNode.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Signal
        </Button>
      </div>
    </Card>
  );
}