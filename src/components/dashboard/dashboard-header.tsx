'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/language-context';

interface DashboardHeaderProps {
  breadcrumbs?: Array<{
    label: string;
    translationKey?: string;
    href?: string;
    isCurrentPage?: boolean;
  }>;
}

/**
 * Dashboard header component that displays breadcrumbs, sidebar trigger, and user controls
 * @param breadcrumbs Array of breadcrumb objects for navigation
 * @returns JSX element containing the dashboard header layout
 */
export function DashboardHeader({ breadcrumbs }: DashboardHeaderProps) {
  const { t, isLoading: languageLoading } = useLanguage();

  if (languageLoading) {
    return null;
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem
                    className={index === 0 ? 'hidden md:block' : ''}
                  >
                    {breadcrumb.isCurrentPage ? (
                      <BreadcrumbPage>
                        {breadcrumb.translationKey
                          ? t(breadcrumb.translationKey)
                          : breadcrumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href || '#'}>
                        {breadcrumb.translationKey
                          ? t(breadcrumb.translationKey)
                          : breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
