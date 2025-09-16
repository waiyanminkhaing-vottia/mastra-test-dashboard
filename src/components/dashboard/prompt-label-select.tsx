'use client';

import { Check, ChevronsUpDown, Edit, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { formatZodErrors, validateClientSide } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';
import { usePromptLabelsStore } from '@/stores/prompt-labels-store';

// Translation key constants to avoid duplication
const TRANSLATION_KEYS = {
  LABELS_NONE: 'labels.none',
  SELECT_LABEL: 'labels.selectLabel',
} as const;

/** Props for the PromptLabelSelect component */
interface PromptLabelSelectProps {
  selectedLabel: string;
  onLabelChange: (labelId: string, labelName?: string) => void;
  trigger?: React.ReactNode;
}

/**
 * A dropdown component for selecting, creating, and editing prompt labels
 * Features include:
 * - Label selection with search/filter
 * - Inline label creation and editing
 * - Real-time validation and error handling
 * - Translation support
 * @param props Component properties
 * @param props.selectedLabel Current selected label ID
 * @param props.onLabelChange Callback function when label selection changes
 * @param props.trigger Optional React node to use as dropdown trigger
 */
export function PromptLabelSelect({
  selectedLabel,
  onLabelChange,
  trigger,
}: PromptLabelSelectProps) {
  const { t } = useLanguage();
  const {
    labels: promptLabels,
    error: fetchError,
    createLabel,
    updateLabel,
    isCreating,
    isUpdating,
    fetchLabels,
  } = usePromptLabelsStore();
  // Local error state management
  const [labelError, setLabelError] = useState<string>('');
  const clearLabelError = () => setLabelError('');

  const [showAddLabelInput, setShowAddLabelInput] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');

  // Fetch labels on mount
  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const handleAddLabel = async () => {
    // Client-side validation with common utility
    const validation = validateClientSide(promptLabelSchema(t), {
      name: newLabelName,
    });

    if (!validation.success) {
      setLabelError(validation.errors.name || t('validation.error'));
      return;
    }

    try {
      await createLabel(newLabelName);
      setNewLabelName('');
      setShowAddLabelInput(false);
      clearLabelError();
    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        data?: { details?: unknown };
      };
      if (apiError.status === 409) {
        // Handle 409 Conflict - label already exists
        setLabelError(t('labels.errors.labelAlreadyExists'));
      } else if (
        apiError.data?.details &&
        Array.isArray(apiError.data.details)
      ) {
        // Handle validation errors from server
        const errors = formatZodErrors({ issues: apiError.data.details });
        setLabelError(errors.name || t('validation.error'));
      } else {
        // Handle other API errors
        setLabelError(t('errors.somethingWentWrong'));
      }
    }
  };

  const handleEditLabel = async (labelId: string) => {
    // Client-side validation with common utility
    const validation = validateClientSide(promptLabelSchema(t), {
      name: editLabelName,
    });

    if (!validation.success) {
      setLabelError(validation.errors.name || t('validation.error'));
      return;
    }

    try {
      await updateLabel(labelId, editLabelName);
      setEditingLabelId(null);
      setEditLabelName('');
      clearLabelError();
    } catch (error: unknown) {
      const apiError = error as {
        status?: number;
        data?: { details?: unknown };
      };
      if (apiError.status === 409) {
        // Handle 409 Conflict - label already exists
        setLabelError(t('labels.errors.labelAlreadyExists'));
      } else if (
        apiError.data?.details &&
        Array.isArray(apiError.data.details)
      ) {
        // Handle validation errors from server
        const errors = formatZodErrors({ issues: apiError.data.details });
        setLabelError(errors.name || t('validation.error'));
      } else {
        // Handle other API errors
        setLabelError(t('errors.somethingWentWrong'));
      }
    }
  };

  const startEditLabel = (label: { id: string; name: string }) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    clearLabelError();
  };

  const cancelEditLabel = () => {
    setEditingLabelId(null);
    setEditLabelName('');
    clearLabelError();
  };

  const filteredLabels = promptLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultTrigger = (
    <Button variant="outline" className="w-64 justify-between">
      {selectedLabel
        ? promptLabels.find(label => label.id === selectedLabel)?.name ||
          t(TRANSLATION_KEYS.LABELS_NONE)
        : t(TRANSLATION_KEYS.SELECT_LABEL)}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="pb-2">
            <h4 className="font-medium text-sm">
              {t('labels.promptVersionLabels')}
            </h4>
          </div>
          <Input
            placeholder={t('labels.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />
          <div
            className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-primary cursor-pointer rounded"
            onClick={() => {
              onLabelChange('', t(TRANSLATION_KEYS.LABELS_NONE));
              setOpen(false);
            }}
          >
            <Check
              className={`h-4 w-4 ${selectedLabel === '' ? 'opacity-100' : 'opacity-0'}`}
            />
            <span>{t(TRANSLATION_KEYS.LABELS_NONE)}</span>
          </div>
          {filteredLabels.map(label => (
            <div
              key={label.id}
              className={`group flex items-center space-x-2 p-2 rounded ${
                editingLabelId === label.id
                  ? 'bg-accent text-primary'
                  : 'hover:bg-accent hover:text-primary'
              }`}
            >
              {editingLabelId === label.id ? (
                // Edit mode
                <div className="space-y-1 w-full">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editLabelName}
                      onChange={e => setEditLabelName(e.target.value)}
                      className={`h-6 text-xs flex-1 ${labelError ? 'border-red-500' : ''}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleEditLabel(label.id);
                        } else if (e.key === 'Escape') {
                          cancelEditLabel();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80 hover:bg-transparent"
                      onClick={() => handleEditLabel(label.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80 hover:bg-transparent"
                      onClick={cancelEditLabel}
                      disabled={isUpdating}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {labelError && (
                    <p className="text-xs text-red-600 pl-2">{t(labelError)}</p>
                  )}
                </div>
              ) : (
                // Display mode
                <>
                  <div
                    className="flex items-center space-x-2 flex-1 cursor-pointer"
                    onClick={() => {
                      onLabelChange(label.id, label.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={`h-4 w-4 ${selectedLabel === label.id ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span>{label.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-transparent"
                    onClick={e => {
                      e.stopPropagation();
                      startEditLabel(label);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
          {fetchError && (
            <div className="p-2 text-xs text-red-600">
              {t('errors.somethingWentWrong')}
            </div>
          )}
          <div className="pt-2 border-t">
            {showAddLabelInput ? (
              <div className="space-y-2">
                <Input
                  placeholder={t('labels.enterLabelName')}
                  value={newLabelName}
                  onChange={e => setNewLabelName(e.target.value)}
                  className="h-8 text-xs"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleAddLabel();
                    }
                  }}
                  autoFocus
                />
                {labelError && (
                  <p className="text-xs text-red-600">{t(labelError)}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs flex-1"
                    onClick={handleAddLabel}
                    disabled={isCreating}
                  >
                    {isCreating && (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    )}
                    {isCreating ? t('labels.adding') : t('labels.add')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs flex-1"
                    onClick={() => {
                      setShowAddLabelInput(false);
                      setNewLabelName('');
                      clearLabelError();
                    }}
                    disabled={isCreating}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs hover:text-primary"
                onClick={() => setShowAddLabelInput(true)}
              >
                {t('labels.addLabel')}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
