'use client';

import type { PromptLabel } from '@prisma/client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import type { PromptWithVersions } from '@/types/prompt';

interface AgentPromptSectionProps {
  promptId: string;
  onPromptChange: (promptId: string) => void;
  labelId: string;
  onLabelChange: (labelId: string) => void;
  prompts: PromptWithVersions[] | null;
  filteredLabels: PromptLabel[];
  errors: Record<string, string>;
}

const ERROR_BORDER_CLASS = 'border-red-500';

/**
 * Component for managing agent prompt and label selection
 * @param props Component properties for prompt and label selection form fields
 * @param props.promptId Current selected prompt ID
 * @param props.onPromptChange Callback when prompt selection changes
 * @param props.labelId Current selected label ID
 * @param props.onLabelChange Callback when label selection changes
 * @param props.prompts Available prompts with versions
 * @param props.filteredLabels Available labels filtered by selected prompt
 * @param props.errors Form validation errors
 * @returns JSX element containing prompt and label selection fields
 */
export function AgentPromptSection({
  promptId,
  onPromptChange,
  labelId,
  onLabelChange,
  prompts,
  filteredLabels,
  errors,
}: AgentPromptSectionProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Prompt Selection Field */}
      <div className="flex items-center gap-6">
        <Label htmlFor="prompt" className="min-w-36">
          {t('agents.form.promptField')}
        </Label>
        <div className="flex-1 space-y-2">
          <Select value={promptId} onValueChange={onPromptChange} required>
            <SelectTrigger
              className={errors.promptId ? ERROR_BORDER_CLASS : ''}
            >
              <SelectValue placeholder={t('agents.form.promptPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {prompts?.map(prompt => (
                <SelectItem key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.promptId && (
            <p className="text-sm text-red-600">{errors.promptId}</p>
          )}
        </div>
      </div>

      {/* Label Selection Field */}
      <div className="flex items-center gap-6">
        <Label htmlFor="label" className="min-w-36">
          {t('agents.form.labelField')}
        </Label>
        <div className="flex-1 space-y-2">
          <Select
            value={labelId}
            onValueChange={onLabelChange}
            disabled={!promptId}
          >
            <SelectTrigger className={errors.labelId ? ERROR_BORDER_CLASS : ''}>
              <SelectValue
                placeholder={
                  !promptId
                    ? t('agents.form.selectPromptFirst')
                    : t('agents.form.labelPlaceholder')
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('labels.none')}</SelectItem>
              {filteredLabels.map((label: PromptLabel) => (
                <SelectItem key={label.id} value={label.id}>
                  {label.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.labelId && (
            <p className="text-sm text-red-600">{errors.labelId}</p>
          )}
        </div>
      </div>
    </>
  );
}
