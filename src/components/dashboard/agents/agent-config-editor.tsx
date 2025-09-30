'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import type { LLMConfig } from '@/types/config';

interface AgentConfigEditorProps {
  useCustomConfig: boolean;
  onUseCustomConfigChange: (useCustomConfig: boolean) => void;
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

/**
 * Component for managing agent LLM configuration settings
 * @param props Component properties for LLM configuration form fields
 * @param props.useCustomConfig Whether custom config is enabled
 * @param props.onUseCustomConfigChange Callback when custom config toggle changes
 * @param props.config Current LLM configuration values
 * @param props.onConfigChange Callback when configuration changes
 * @returns JSX element containing LLM configuration editor
 */
export function AgentConfigEditor({
  useCustomConfig,
  onUseCustomConfigChange,
  config,
  onConfigChange,
}: AgentConfigEditorProps) {
  const { t } = useLanguage();

  const handleConfigReset = () => {
    onConfigChange({
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    });
  };

  const updateConfig = (field: keyof LLMConfig, value: number) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <>
      {/* Custom Config Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="useCustomConfig"
          checked={useCustomConfig}
          onCheckedChange={(checked: boolean) =>
            onUseCustomConfigChange(checked)
          }
        />
        <Label
          htmlFor="useCustomConfig"
          className="text-sm font-medium cursor-pointer"
        >
          {t('agents.form.useCustomConfig')}
        </Label>
      </div>

      {/* LLM Configuration Section */}
      {useCustomConfig && (
        <div className="space-y-6 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-12">
            <h4 className="text-sm font-medium text-gray">
              {t('agents.form.llmConfigTitle')}
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleConfigReset}
              className="text-xs"
            >
              {t('agents.form.resetToDefault')}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature Field */}
            <div className="flex items-center gap-4">
              <Label htmlFor="temperature" className="min-w-24">
                {t('agents.form.temperatureField')}
              </Label>
              <div className="flex-1">
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={config.temperature}
                  onChange={e =>
                    updateConfig('temperature', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Max Tokens Field */}
            <div className="flex items-center gap-4">
              <Label htmlFor="maxTokens" className="min-w-24">
                {t('agents.form.maxTokensField')}
              </Label>
              <div className="flex-1">
                <Input
                  id="maxTokens"
                  type="number"
                  min="1"
                  max="8192"
                  value={config.maxTokens}
                  onChange={e =>
                    updateConfig('maxTokens', parseInt(e.target.value) || 1000)
                  }
                />
              </div>
            </div>

            {/* Top P Field */}
            <div className="flex items-center gap-4">
              <Label htmlFor="topP" className="min-w-24">
                {t('agents.form.topPField')}
              </Label>
              <div className="flex-1">
                <Input
                  id="topP"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={config.topP}
                  onChange={e =>
                    updateConfig('topP', parseFloat(e.target.value) || 1.0)
                  }
                />
              </div>
            </div>

            {/* Frequency Penalty Field */}
            <div className="flex items-center gap-4">
              <Label htmlFor="frequencyPenalty" className="min-w-24">
                {t('agents.form.frequencyPenaltyField')}
              </Label>
              <div className="flex-1">
                <Input
                  id="frequencyPenalty"
                  type="number"
                  step="0.1"
                  min="-2"
                  max="2"
                  value={config.frequencyPenalty}
                  onChange={e =>
                    updateConfig(
                      'frequencyPenalty',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>

            {/* Presence Penalty Field */}
            <div className="flex items-center gap-4 col-span-2">
              <Label htmlFor="presencePenalty" className="min-w-24">
                {t('agents.form.presencePenaltyField')}
              </Label>
              <div className="flex-1 max-w-xs">
                <Input
                  id="presencePenalty"
                  type="number"
                  step="0.1"
                  min="-2"
                  max="2"
                  value={config.presencePenalty}
                  onChange={e =>
                    updateConfig(
                      'presencePenalty',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
