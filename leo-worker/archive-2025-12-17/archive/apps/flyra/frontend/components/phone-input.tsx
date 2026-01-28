'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
}

const countryCodesMap: Record<string, { code: string, flag: string, phoneCode: string }> = {
  'US': { code: 'US', flag: '🇺🇸', phoneCode: '+1' },
  'KE': { code: 'KE', flag: '🇰🇪', phoneCode: '+254' },
  'NG': { code: 'NG', flag: '🇳🇬', phoneCode: '+234' },
  'GH': { code: 'GH', flag: '🇬🇭', phoneCode: '+233' },
  'IN': { code: 'IN', flag: '🇮🇳', phoneCode: '+91' },
  'ZA': { code: 'ZA', flag: '🇿🇦', phoneCode: '+27' },
  'UG': { code: 'UG', flag: '🇺🇬', phoneCode: '+256' },
  'TZ': { code: 'TZ', flag: '🇹🇿', phoneCode: '+255' },
  'RW': { code: 'RW', flag: '🇷🇼', phoneCode: '+250' },
};

export function PhoneInput({ value, onChange, defaultCountry = 'US', disabled }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Parse existing value if it includes country code
    if (value) {
      let found = false;
      for (const [code, data] of Object.entries(countryCodesMap)) {
        if (value.startsWith(data.phoneCode)) {
          setSelectedCountry(code);
          setPhoneNumber(value.slice(data.phoneCode.length));
          found = true;
          break;
        }
      }
      if (!found) {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  useEffect(() => {
    if (defaultCountry && !value) {
      setSelectedCountry(defaultCountry);
    }
  }, [defaultCountry, value]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    updateFullNumber(phoneNumber, country);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Only allow digits
    setPhoneNumber(input);
    updateFullNumber(input, selectedCountry);
  };

  const updateFullNumber = (number: string, country: string) => {
    const countryData = countryCodesMap[country];
    if (number) {
      onChange(`${countryData.phoneCode}${number}`);
    } else {
      onChange('');
    }
  };

  const formatPhoneDisplay = (number: string) => {
    // Basic formatting - can be enhanced based on country
    if (!number) return '';
    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
    if (number.length <= 10) return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 10)} ${number.slice(10)}`;
  };

  return (
    <div className="flex gap-2">
      <Select
        value={selectedCountry}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {countryCodesMap[selectedCountry] && (
              <span className="flex items-center gap-2">
                <span>{countryCodesMap[selectedCountry].flag}</span>
                <span>{countryCodesMap[selectedCountry].phoneCode}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(countryCodesMap).map(([code, data]) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span>{data.flag}</span>
                <span>{data.phoneCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        placeholder="123 456 7890"
        value={formatPhoneDisplay(phoneNumber)}
        onChange={handlePhoneChange}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}