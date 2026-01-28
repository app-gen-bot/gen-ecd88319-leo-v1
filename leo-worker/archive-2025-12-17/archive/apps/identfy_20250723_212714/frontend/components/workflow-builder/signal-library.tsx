"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Fingerprint, 
  Phone, 
  Mail, 
  Monitor, 
  Shield 
} from 'lucide-react';

export const signalTypes = {
  document: {
    name: "Document Verification",
    icon: FileText,
    color: "bg-blue-500",
    providers: ["IDnow", "Jumio", "Onfido"],
    defaultSettings: {
      documentTypes: ["passport", "drivers_license", "national_id"],
      extractData: true,
      checkExpiry: true,
      minimumQuality: 80,
    },
  },
  biometric: {
    name: "Biometric Check",
    icon: Fingerprint,
    color: "bg-green-500",
    providers: ["BioID", "FaceTec", "iProov"],
    defaultSettings: {
      livenessCheck: true,
      matchThreshold: 95,
      maxAttempts: 3,
    },
  },
  phone: {
    name: "Phone Verification",
    icon: Phone,
    color: "bg-purple-500",
    providers: ["Twilio", "Vonage", "MessageBird"],
    defaultSettings: {
      verificationMethod: ["sms", "voice", "whatsapp"],
      codeLength: 6,
      expiryMinutes: 10,
    },
  },
  email: {
    name: "Email Verification",
    icon: Mail,
    color: "bg-orange-500",
    providers: ["SendGrid", "Mailgun", "AWS SES"],
    defaultSettings: {
      verificationLink: true,
      linkExpiryHours: 24,
      checkDomain: true,
    },
  },
  device: {
    name: "Device Fingerprinting",
    icon: Monitor,
    color: "bg-indigo-500",
    providers: ["Fingerprint.js", "IPQualityScore", "MaxMind"],
    defaultSettings: {
      checkVPN: true,
      checkProxy: true,
      riskThreshold: 50,
    },
  },
  watchlist: {
    name: "Watchlist Screening",
    icon: Shield,
    color: "bg-red-500",
    providers: ["ComplyAdvantage", "Refinitiv", "Dow Jones"],
    defaultSettings: {
      lists: ["sanctions", "pep", "adverse_media"],
      fuzzyMatching: true,
      matchThreshold: 85,
    },
  },
};

interface SignalLibraryProps {
  onDragStart?: (signalType: string, signalData: any) => void;
  onDragEnd?: () => void;
}

export function SignalLibrary({ onDragStart, onDragEnd }: SignalLibraryProps) {
  const handleDragStart = (event: React.DragEvent, signalType: string) => {
    const signal = signalTypes[signalType as keyof typeof signalTypes];
    const signalData = {
      label: signal.name,
      signalType,
      provider: signal.providers[0],
      required: true,
      settings: signal.defaultSettings,
    };

    event.dataTransfer.setData('application/reactflow', 'signalNode');
    event.dataTransfer.setData('signalData', JSON.stringify(signalData));
    event.dataTransfer.effectAllowed = 'move';

    onDragStart?.(signalType, signalData);
  };

  return (
    <div className="h-full bg-muted/20 p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Signal Library</h3>
      <div className="space-y-2">
        {Object.entries(signalTypes).map(([key, signal]) => {
          const Icon = signal.icon;
          return (
            <Card
              key={key}
              draggable
              onDragStart={(e) => handleDragStart(e, key)}
              onDragEnd={onDragEnd}
              className="p-3 cursor-move hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${signal.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{signal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {signal.providers.length} providers
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">How to use</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag signals onto the canvas</li>
          <li>• Connect signals by dragging from handles</li>
          <li>• Click a signal to edit properties</li>
          <li>• Delete with DEL key or button</li>
        </ul>
      </div>
    </div>
  );
}