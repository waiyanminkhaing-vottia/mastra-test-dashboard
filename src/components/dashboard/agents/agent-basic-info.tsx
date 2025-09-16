'use client';

import type { Model, Provider } from '@prisma/client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { PROVIDERS } from '@/lib/constants';

interface AgentBasicInfoProps {
  name: string;
  onNameChange: (name: string) => void;
  provider: Provider | '';
  onProviderChange: (provider: Provider) => void;
  modelId: string;
  onModelChange: (modelId: string) => void;
  filteredModels: Model[];
  errors: Record<string, string>;
}

const ERROR_BORDER_CLASS = 'border-red-500';

/**
 * Component for managing basic agent information (name, provider, model)
 * @param props Component properties for basic agent information form fields
 * @param props.name Current agent name value
 * @param props.onNameChange Callback when name changes
 * @param props.provider Current selected provider
 * @param props.onProviderChange Callback when provider changes
 * @param props.modelId Current selected model ID
 * @param props.onModelChange Callback when model changes
 * @param props.filteredModels Available models filtered by provider
 * @param props.errors Form validation errors
 * @returns JSX element containing name, provider, and model selection fields
 */
export function AgentBasicInfo({
  name,
  onNameChange,
  provider,
  onProviderChange,
  modelId,
  onModelChange,
  filteredModels,
  errors,
}: AgentBasicInfoProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Agent Name Field */}
      <div className="flex items-center gap-7">
        <Label htmlFor="name" className="min-w-36">
          {t('agents.form.nameField')}
        </Label>
        <div className="flex-1 space-y-2">
          <Input
            id="name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder={t('agents.form.namePlaceholder')}
            className={errors.name ? ERROR_BORDER_CLASS : ''}
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>
      </div>

      {/* Provider Selection Field */}
      <div className="flex items-center gap-6">
        <Label htmlFor="provider" className="min-w-36">
          {t('agents.form.providerField')}
        </Label>
        <div className="flex-1 space-y-2">
          <Select
            value={provider}
            onValueChange={value => onProviderChange(value as Provider)}
            required
          >
            <SelectTrigger
              className={errors.provider ? ERROR_BORDER_CLASS : ''}
            >
              <SelectValue placeholder={t('agents.form.providerPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.provider && (
            <p className="text-sm text-red-600">{errors.provider}</p>
          )}
        </div>
      </div>

      {/* Model Selection Field */}
      <div className="flex items-center gap-6">
        <Label htmlFor="model" className="min-w-36">
          {t('agents.form.modelField')}
        </Label>
        <div className="flex-1 space-y-2">
          <Select
            value={modelId}
            onValueChange={onModelChange}
            required
            disabled={!provider}
          >
            <SelectTrigger className={errors.modelId ? ERROR_BORDER_CLASS : ''}>
              <SelectValue
                placeholder={
                  !provider
                    ? t('agents.form.selectProviderFirst')
                    : t('agents.form.modelPlaceholder')
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredModels.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.modelId && (
            <p className="text-sm text-red-600">{errors.modelId}</p>
          )}
        </div>
      </div>
    </>
  );
}
