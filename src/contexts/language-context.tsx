'use client';

import * as React from 'react';

import enTranslations from '@/locales/en.json';
import jaTranslations from '@/locales/ja.json';

type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

const translations = {
  en: enTranslations,
  ja: jaTranslations,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>('en');
  const [mounted, setMounted] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
    // Read from cookie after mount to avoid hydration mismatch
    const savedLanguage = document.cookie
      .split('; ')
      .find(row => row.startsWith('language='))
      ?.split('=')[1] as Language;

    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = React.useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    // Save to cookie
    document.cookie = `language=${newLanguage}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const t = React.useCallback(
    (key: string) => {
      const keys = key.split('.');
      let value: unknown = translations[language];

      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }

      return (value as string) || key;
    },
    [language]
  );

  const value = React.useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t,
      isLoading: !mounted,
    }),
    [language, handleSetLanguage, t, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
