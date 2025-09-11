import { Plus } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';

export default function ToolsPage() {
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
            label: 'Tools',
            translationKey: 'breadcrumbs.tools',
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
            <p className="text-muted-foreground">
              Manage tools and functions available to your agents
            </p>
          </div>
          <Button>
            <Plus className="size-4 mr-2" />
            Add Tool
          </Button>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
