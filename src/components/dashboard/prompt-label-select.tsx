'use client';

import { Check, ChevronsUpDown, Edit, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { useLabelValidation } from '@/hooks/use-label-validation';
import { usePromptLabels } from '@/hooks/use-prompt-labels';

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
 * @param props - Component props
 */
export function PromptLabelSelect({
  selectedLabel,
  onLabelChange,
  trigger,
}: PromptLabelSelectProps) {
  const { t } = useLanguage();
  const {
    promptLabels,
    fetchError,
    createLabel,
    updateLabel,
    isCreating,
    isUpdating,
  } = usePromptLabels();
  const { error: labelError, validateLabel, clearError } = useLabelValidation();

  const [showAddLabelInput, setShowAddLabelInput] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');

  const handleAddLabel = async () => {
    if (!validateLabel(newLabelName, t)) {
      return;
    }

    const newLabel = await createLabel(newLabelName);
    if (newLabel) {
      setNewLabelName('');
      setShowAddLabelInput(false);
      clearError();
    }
  };

  const handleEditLabel = async (labelId: string) => {
    if (!validateLabel(editLabelName, t)) {
      return;
    }

    const updatedLabel = await updateLabel(labelId, editLabelName);
    if (updatedLabel) {
      setEditingLabelId(null);
      setEditLabelName('');
      clearError();
    }
  };

  const startEditLabel = (label: { id: string; name: string }) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    clearError();
  };

  const cancelEditLabel = () => {
    setEditingLabelId(null);
    setEditLabelName('');
    clearError();
  };

  const filteredLabels = promptLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const defaultTrigger = (
    <Button variant="outline" className="w-64 justify-between">
      {selectedLabel
        ? promptLabels.find(label => label.id === selectedLabel)?.name ||
          t('labels.none')
        : t('labels.selectLabel')}
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
              onLabelChange('', 'None');
              setOpen(false);
            }}
          >
            <Check
              className={`h-4 w-4 ${selectedLabel === '' ? 'opacity-100' : 'opacity-0'}`}
            />
            <span>{t('labels.none')}</span>
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
                      clearError();
                    }}
                    disabled={isCreating}
                  >
                    {t('labels.cancel')}
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
