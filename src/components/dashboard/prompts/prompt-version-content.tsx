'use client';

import { Check, Copy, Info } from 'lucide-react';
import { useState } from 'react';

import { PromptLabelSelect } from '@/components/dashboard/prompt-label-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-context';
import { usePromptLabelsStore } from '@/stores/prompt-labels-store';
import type {
  PromptVersionWithLabel,
  PromptWithVersions,
} from '@/types/prompt';

interface PromptVersionContentProps {
  prompt: PromptWithVersions;
  selectedVersion: PromptVersionWithLabel;
  onLabelChange: (labelId: string, labelName: string) => void;
}

/**
 * Displays the content and details of a selected prompt version
 * Features include version info, label management, and content copying
 * @param props Component properties
 * @param props.prompt Prompt data with versions
 * @param props.selectedVersion Currently selected prompt version with label data
 * @param props.onLabelChange Callback function when label assignment changes
 */
export function PromptVersionContent({
  prompt,
  selectedVersion,
  onLabelChange,
}: PromptVersionContentProps) {
  const { t } = useLanguage();
  const { labels } = usePromptLabelsStore();
  const [copied, setCopied] = useState(false);

  // Get the current label name from the labels store to ensure it's up-to-date
  const currentLabelName = selectedVersion.labelId
    ? labels.find(label => label.id === selectedVersion.labelId)?.name ||
      selectedVersion.label?.name
    : undefined;

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

  return (
    <div className="rounded-lg border bg-background text-card-foreground shadow-sm">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-2 py-1">
            #{selectedVersion.version}
          </Badge>
          <h2 className="text-lg font-semibold">{prompt.name}</h2>
          {currentLabelName && (
            <Badge
              variant="outline"
              className="text-sm px-2 py-1 border-primary text-primary"
            >
              {currentLabelName}
            </Badge>
          )}
          <PromptLabelSelect
            selectedLabel={selectedVersion?.labelId || ''}
            onLabelChange={(labelId, labelName = 'None') => {
              const currentLabelId = selectedVersion?.labelId || '';
              const newLabelId = labelId || '';

              if (currentLabelId === newLabelId) return;

              onLabelChange(labelId, labelName);
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
    </div>
  );
}
