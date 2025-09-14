'use client';

import {
  Check,
  ChevronLeft,
  Clock,
  Copy,
  Info,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PromptLabelSelect } from '@/components/dashboard/prompt-label-select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { formatDate } from '@/lib/utils';
import type { PromptWithVersions } from '@/types/prompt';

/**
 * Page component that displays different versions of a prompt with their content and labels
 * @returns JSX element containing the prompt versions management interface
 */
export default function PromptVersionsPage() {
  const { t, isLoading: languageLoading } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [pendingLabelChange, setPendingLabelChange] = useState<{
    labelId: string;
    labelName: string;
  } | null>(null);
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false);

  const promptId = params.id as string;
  const selectedVersionId = searchParams.get('version');
  const selectedVersion =
    prompt?.versions?.find(v => v.id === selectedVersionId) ||
    prompt?.versions?.[0];

  // Filter versions based on search query with memoization
  const filteredVersions = useMemo(() => {
    if (!prompt?.versions) return [];
    if (!searchQuery) return prompt.versions;

    const query = searchQuery.toLowerCase();
    return prompt.versions.filter(
      version =>
        version.version.toString().includes(query) ||
        version.label?.name?.toLowerCase().includes(query) ||
        version.changeNote?.toLowerCase().includes(query)
    );
  }, [prompt?.versions, searchQuery]);

  const fetchPrompt = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/prompts/${promptId}`);
      if (response.ok) {
        const data = await response.json();
        setPrompt(data);
      } else {
        setError('errors.somethingWentWrong');
      }
    } catch {
      setError('errors.somethingWentWrong');
    } finally {
      setLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    if (promptId) {
      fetchPrompt();
    }
  }, [promptId, fetchPrompt]);

  const handleVersionSelect = (versionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('version', versionId);
    router.push(`/prompts/${promptId}/versions?${newSearchParams.toString()}`);
  };

  const handleCopyPrompt = async () => {
    if (!selectedVersion?.content) return;

    try {
      await navigator.clipboard.writeText(selectedVersion.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed silently
    }
  };

  const handleConfirmLabelChange = async () => {
    if (!pendingLabelChange || !selectedVersion) return;

    try {
      setIsUpdatingLabel(true);
      const response = await fetch(
        `/api/prompt-versions/${selectedVersion.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ labelId: pendingLabelChange.labelId }),
        }
      );

      if (response.ok) {
        const updatedVersion = await response.json();
        setPrompt(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            versions: prev.versions.map(version =>
              version.id === selectedVersion.id
                ? {
                    ...version,
                    label: updatedVersion.label,
                    labelId: updatedVersion.labelId,
                  }
                : version
            ),
          };
        });
        toast.success(t('prompts.versions.labelUpdatedSuccess'));
      } else {
        toast.error(t('prompts.versions.labelUpdateFailed'));
      }
    } catch {
      toast.error(t('prompts.versions.labelUpdateFailed'));
    } finally {
      setIsUpdatingLabel(false);
      setPendingLabelChange(null);
    }
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
              translationKey: 'breadcrumbs.management',
              href: '/',
            },
            {
              label: 'Prompts',
              translationKey: 'breadcrumbs.prompts',
              href: '/prompts',
            },
            {
              label: 'Loading...',
              isCurrentPage: true,
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mt-4">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-6 h-full">
            <div className="w-80 space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !prompt) {
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
              label: 'Error',
              isCurrentPage: true,
            },
          ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">
              {t(error || 'errors.somethingWentWrong')}
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
            translationKey: 'breadcrumbs.management',
            href: '/',
          },
          {
            label: 'Prompts',
            translationKey: 'breadcrumbs.prompts',
            href: '/prompts',
          },
          {
            label: prompt.name,
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-4 mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/prompts">
              <ChevronLeft className="size-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-[320px_1fr] gap-4 h-[calc(100vh-200px)]">
          {/* Left Sidebar - Version List */}
          <Sidebar
            collapsible="none"
            className="relative border rounded-lg shadow-sm w-full bg-background"
          >
            <SidebarHeader className="border-b p-3 pb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t('prompts.versions.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 h-8"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-primary"
                >
                  <Plus className="size-4" />
                  {t('common.new')}
                </Button>
              </div>
            </SidebarHeader>

            <SidebarContent className="pt-2">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredVersions.map(version => (
                      <SidebarMenuItem key={version.id}>
                        <SidebarMenuButton
                          isActive={selectedVersion?.id === version.id}
                          onClick={() => handleVersionSelect(version.id)}
                          className="h-auto p-3 flex-col items-start gap-2"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 min-w-[3rem] text-center"
                            >
                              #{version.version}
                            </Badge>
                            {version.label && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0.5 border-primary text-primary"
                              >
                                {version.label.name}
                              </Badge>
                            )}
                          </div>
                          {version.changeNote && (
                            <p className="text-xs text-muted-foreground text-left line-clamp-1 w-full">
                              {version.changeNote}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground w-full">
                            <Clock className="size-3" />
                            {formatDate(version.createdAt)}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Right Content - Prompt Display */}
          <div className="rounded-lg border bg-background text-card-foreground shadow-sm">
            {selectedVersion ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm px-2 py-1">
                    #{selectedVersion.version}
                  </Badge>
                  <h2 className="text-lg font-semibold">{prompt.name}</h2>
                  {selectedVersion.label && (
                    <Badge
                      variant="outline"
                      className="text-sm px-2 py-1 border-primary text-primary"
                    >
                      {selectedVersion.label.name}
                    </Badge>
                  )}
                  <AlertDialog
                    open={!!pendingLabelChange}
                    onOpenChange={open => !open && setPendingLabelChange(null)}
                  >
                    <PromptLabelSelect
                      selectedLabel={selectedVersion?.labelId || ''}
                      onLabelChange={(labelId, labelName = 'None') => {
                        const currentLabelId = selectedVersion?.labelId || '';
                        const newLabelId = labelId || '';

                        if (currentLabelId === newLabelId) return;

                        setPendingLabelChange({ labelId, labelName });
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          className="h-[28px] w-[28px] p-0 hover:text-primary"
                        >
                          <Info className="size-4" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('prompts.versions.confirmLabelChange')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="inline-flex flex-wrap items-center gap-1">
                          <span>
                            {t('prompts.versions.confirmLabelChangeMessage')}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              pendingLabelChange?.labelId
                                ? 'border-primary text-primary'
                                : ''
                            }
                          >
                            {pendingLabelChange?.labelName}
                          </Badge>
                          <span>?</span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel disabled={isUpdatingLabel}>
                          {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleConfirmLabelChange()}
                          disabled={isUpdatingLabel}
                        >
                          {isUpdatingLabel && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {t('common.confirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground tracking-wide">
                      {t('prompts.form.contentField')}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPrompt}
                      className="h-6 px-2 hover:text-primary"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 mr-1" />
                          {t('common.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 mr-1" />
                          {t('common.copy')}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {selectedVersion.content}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="text-muted-foreground text-lg">
                  {t('prompts.versions.noVersionSelected')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('prompts.versions.selectVersionMessage')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
