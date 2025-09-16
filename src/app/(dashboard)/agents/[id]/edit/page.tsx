'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AgentForm } from '@/components/dashboard/agent-form';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { useAgentsStore } from '@/stores/agents-store';
import type { AgentWithRelations } from '@/types/agent';

interface EditAgentPageProps {
  params: Promise<{ id: string }>;
}

// Constants to avoid duplicate literals
const AGENTS_PATH = '/agents';
const BACK_TRANSLATION_KEY = 'common.back';
const MANAGEMENT_BREADCRUMB_KEY = 'breadcrumbs.management';
const AGENTS_BREADCRUMB_KEY = 'breadcrumbs.agents';

/**
 * Page component for editing an existing agent
 * @returns JSX element containing the agent edit form
 */
export default function EditAgentPage({ params }: EditAgentPageProps) {
  const { t, isLoading: languageLoading } = useLanguage();
  const router = useRouter();
  const { fetchAgent, loading } = useAgentsStore();
  const [agent, setAgent] = useState<AgentWithRelations | null>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    params.then(resolvedParams => {
      setAgentId(resolvedParams.id);
    });
  }, [params]);

  // Fetch agent data
  useEffect(() => {
    if (!agentId) return;

    const loadAgent = async () => {
      try {
        setFetchError(null);
        const fetchedAgent = await fetchAgent(agentId);
        setAgent(fetchedAgent);
      } catch {
        setFetchError('agents.errors.agentNotFound');
      }
    };

    loadAgent();
  }, [agentId, fetchAgent]);

  const handleSuccess = () => {
    router.push(AGENTS_PATH);
  };

  const handleCancel = () => {
    router.push(AGENTS_PATH);
  };

  if (languageLoading) {
    return null;
  }

  if (loading) {
    return (
      <>
        <DashboardHeader
          breadcrumbs={[
            {
              label: 'Management',
              translationKey: MANAGEMENT_BREADCRUMB_KEY,
              href: '/',
            },
            {
              label: 'Agents',
              translationKey: AGENTS_BREADCRUMB_KEY,
              href: AGENTS_PATH,
            },
            {
              label: '',
              isCurrentPage: true,
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-6 mt-4">
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="space-y-8 pb-8">
                <div className="flex items-center gap-7">
                  <Skeleton className="min-h-10 w-36" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Skeleton className="min-h-10 w-36" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Skeleton className="min-h-10 w-36" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Skeleton className="min-h-10 w-36" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Skeleton className="min-h-10 w-36" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </div>

                <div className="flex gap-3 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (fetchError || (!loading && !agent)) {
    return (
      <>
        <DashboardHeader
          breadcrumbs={[
            {
              label: 'Management',
              translationKey: MANAGEMENT_BREADCRUMB_KEY,
              href: '/',
            },
            {
              label: 'Agents',
              translationKey: AGENTS_BREADCRUMB_KEY,
              href: AGENTS_PATH,
            },
            {
              label: '',
              isCurrentPage: true,
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={AGENTS_PATH}>
                <ChevronLeft className="size-4 mr-2" />
                {t(BACK_TRANSLATION_KEY)}
              </Link>
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {t('agents.errors.agentNotFound')}
            </h2>
            <p className="text-muted-foreground mt-4">
              {t('agents.errors.agentNotFoundDescription')}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          {
            label: 'Management',
            translationKey: MANAGEMENT_BREADCRUMB_KEY,
            href: '/',
          },
          {
            label: 'Agents',
            translationKey: AGENTS_BREADCRUMB_KEY,
            href: '/agents',
          },
          {
            label: agent?.name || '',
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
          <div className="w-full max-w-2xl">
            <AgentForm
              agent={agent}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              isEditing
            />
          </div>
        </div>
      </div>
    </>
  );
}
