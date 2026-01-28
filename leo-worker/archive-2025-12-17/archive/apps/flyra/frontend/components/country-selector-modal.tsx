'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Check } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  exchangeRate: number;
}

interface CountrySelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountry: string;
  onCountrySelect: (country: Country) => void;
}

const countries: Country[] = [
  { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', exchangeRate: 154.50 },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', exchangeRate: 912.50 },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳', exchangeRate: 83.25 },
  { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭', exchangeRate: 56.40 },
];

export function CountrySelectorModal({
  open,
  onOpenChange,
  selectedCountry,
  onCountrySelect,
}: CountrySelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Destination Country</DialogTitle>
          <DialogDescription>
            Choose where you want to send money
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-4 space-y-2">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onCountrySelect(country);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{country.name}</p>
                    <p className="text-sm text-muted-foreground">
                      1 USD = {country.exchangeRate} {country.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{country.currency}</Badge>
                  {selectedCountry === country.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            ))}

            {filteredCountries.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No countries found
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}