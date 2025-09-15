'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton component for prompt versions page
 * Displays skeleton placeholders that match the actual layout structure
 * @returns Loading skeleton with header, sidebar, and content placeholders
 */
export function PromptVersionsLoadingSkeleton() {
  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          {
            label: 'Management',
            translationKey: 'breadcrumbs.management',
            href: '/',
          },
          {
            label: 'Prompts',
            translationKey: 'breadcrumbs.prompts',
            href: '/prompts',
          },
          {
            label: '...',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100vh-200px)]">
          {/* Left Sidebar Skeleton - Version List */}
          <div className="relative border rounded-lg shadow-sm w-full bg-background">
            {/* Header with search and new button */}
            <div className="border-b p-3 pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>

            {/* Version list items */}
            <div className="pt-2 p-2 space-y-1">
              {Array.from({ length: 5 }, (_, index) => index).map(index => (
                <div
                  key={`skeleton-version-${index}`}
                  className="p-3 space-y-2"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Skeleton - Prompt Display */}
          <div className="rounded-lg border bg-background shadow-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-7 w-7" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
