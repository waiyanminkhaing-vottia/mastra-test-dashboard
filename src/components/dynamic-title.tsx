'use client';

import { useEffect } from 'react';

import { useLanguage } from '@/contexts/language-context';
import { getTenantPageTitle } from '@/lib/constants';

/**
 * Client component that dynamically updates the document title
 * based on the current language selection
 */
export function DynamicTitle() {
  const { language, isLoading } = useLanguage();

  useEffect(() => {
    // Don't update title until language context is fully loaded
    if (isLoading) return;

    document.title = getTenantPageTitle(language);
  }, [language, isLoading]);

  return null;
}
