'use client';

import { ChevronDown, Globe } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'ja' as const, name: '日本語', flag: '🇯🇵' },
];

export function LanguageSwitcher() {
  const { language, setLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = languages.find(lang => lang.code === language);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="h-9 px-3 gap-2" disabled>
        <Globe className="size-4" />
        <span className="hidden sm:inline">...</span>
        <span className="sm:hidden">🌐</span>
        <ChevronDown className="size-3" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <span className="sm:hidden">{currentLang?.flag}</span>
        <ChevronDown className="size-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] bg-background border rounded-md shadow-lg">
          {languages.map(language => (
            <button
              key={language.code}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              onClick={() => {
                setLanguage(language.code);
                setIsOpen(false);
              }}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLang?.code && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
