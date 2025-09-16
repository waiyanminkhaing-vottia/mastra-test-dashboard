'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AgentForm } from '@/components/dashboard/agent-form';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

/**
 * Page component for creating a new agent
 * @returns JSX element containing the new agent creation form
 */
export default function NewAgentPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/agents');
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  if (languageLoading) {
    return null;
  }

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
            label: 'Agents',
            translationKey: 'breadcrumbs.agents',
            href: '/agents',
          },
          {
            label: 'New Agent',
            translationKey: 'agents.form.title',
            isCurrentPage: true,
          },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-6 mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/agents">
              <ChevronLeft className="size-4" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <AgentForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </div>
    </>
  );
}
