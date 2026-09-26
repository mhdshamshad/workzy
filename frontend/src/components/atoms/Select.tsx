import { AlertCircle } from 'lucide-react';
import React from 'react';

import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  value?: T;
  onChange?: (v: T) => void;
  placeholder?: string;
  error?: string;
  options: Option<T>[];
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  customClass?: string;
  ariaLabel?: string;
}

export default function Select<T extends string>({
  value,
  onChange,
  placeholder,
  error,
  options,
  leftIcon,
  disabled = false,
  customClass,
  ariaLabel,
}: Props<T>) {
  return (
    <div>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
            {leftIcon}
          </span>
        )}

        <ShadSelect value={value} onValueChange={onChange}>
          <SelectTrigger
            aria-label={
              ariaLabel ||
              placeholder ||
              options.find(o => o.value === value)?.label ||
              'Select option'
            }
            className={cn(
              'w-full py-5 px-3 rounded-lg bg-background border border-input text-foreground',
              'transition-all outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
              leftIcon && 'pl-10',
              error && 'border-destructive bg-destructive/10',
              disabled && 'opacity-60 cursor-not-allowed bg-muted',
              customClass
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent hidden={disabled}>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadSelect>
      </div>
      <div className="min-h-[1.2rem] mt-1 flex items-center">
        {error ? (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        ) : (
          <span className="text-sm invisible">placeholder</span>
        )}
      </div>
    </div>
  );
}
