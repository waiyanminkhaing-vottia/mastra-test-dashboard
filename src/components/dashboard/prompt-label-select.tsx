'use client';

import type { PromptLabel } from '@prisma/client';
import { Check, ChevronsUpDown, Edit, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';
import { formatZodErrors } from '@/lib/validation-utils';
import { promptLabelSchema } from '@/lib/validations/prompt-label';

interface PromptLabelSelectProps {
  selectedLabel: string;
  onLabelChange: (labelId: string) => void;
  trigger?: React.ReactNode;
}

export function PromptLabelSelect({
  selectedLabel,
  onLabelChange,
  trigger,
}: PromptLabelSelectProps) {
  const { t } = useLanguage();
  const [showAddLabelInput, setShowAddLabelInput] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [labelError, setLabelError] = useState<string>('');
  const [promptLabels, setPromptLabels] = useState<PromptLabel[]>([]);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');

  const fetchPromptLabels = async () => {
    try {
      setFetchError(false);
      const response = await fetch('/api/prompt-labels');
      if (response.ok) {
        const data = await response.json();
        setPromptLabels(data);
      } else {
        setFetchError(true);
      }
    } catch (_error) {
      setFetchError(true);
    }
  };

  const handleAddLabel = async () => {
    // Client-side validation with Zod
    const validationResult = promptLabelSchema(t).safeParse({
      name: newLabelName,
    });

    if (!validationResult.success) {
      const errors = formatZodErrors(validationResult.error);
      setLabelError(errors.name || 'Validation error');
      return;
    }

    setLabelError('');

    try {
      const response = await fetch('/api/prompt-labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (response.ok) {
        const newLabel = await response.json();
        setPromptLabels(prev => [...prev, newLabel]);
        setNewLabelName('');
        setShowAddLabelInput(false);
        setLabelError('');
      } else if (response.status === 409) {
        // Handle 409 Conflict - label already exists
        setLabelError('labels.errors.labelAlreadyExists');
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          // Handle validation errors from server
          const errors = formatZodErrors({ issues: error.details });
          setLabelError(errors.name || 'Validation error');
        } else {
          setLabelError('labels.errors.failedToCreate');
        }
      }
    } catch (_error) {
      setLabelError('labels.errors.failedToCreate');
    }
  };

  const handleEditLabel = async (labelId: string) => {
    // Client-side validation with Zod
    const validationResult = promptLabelSchema(t).safeParse({
      name: editLabelName,
    });

    if (!validationResult.success) {
      const errors = formatZodErrors(validationResult.error);
      setLabelError(errors.name || 'Validation error');
      return;
    }

    setLabelError('');

    try {
      const response = await fetch(`/api/prompt-labels/${labelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      if (response.ok) {
        const updatedLabel = await response.json();
        setPromptLabels(prev =>
          prev.map(label => (label.id === labelId ? updatedLabel : label))
        );
        setEditingLabelId(null);
        setEditLabelName('');
        setLabelError('');
      } else if (response.status === 409) {
        // Handle 409 Conflict - label already exists
        setLabelError('labels.errors.labelAlreadyExists');
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          // Handle validation errors from server
          const errors = formatZodErrors({ issues: error.details });
          setLabelError(errors.name || 'Validation error');
        } else {
          setLabelError('labels.errors.failedToCreate');
        }
      }
    } catch (_error) {
      setLabelError('labels.errors.failedToCreate');
    }
  };

  const startEditLabel = (label: { id: string; name: string }) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    setLabelError('');
  };

  const cancelEditLabel = () => {
    setEditingLabelId(null);
    setEditLabelName('');
    setLabelError('');
  };

  const filteredLabels = promptLabels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchPromptLabels();
  }, []);

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
            className="flex items-center space-x-2 p-2 hover:text-primary cursor-pointer rounded"
            onClick={() => {
              onLabelChange('');
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
                  ? 'text-primary'
                  : 'hover:text-primary'
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
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                      onClick={() => handleEditLabel(label.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                      onClick={cancelEditLabel}
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
                      onLabelChange(label.id);
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
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
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
                  >
                    {t('labels.add')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs flex-1"
                    onClick={() => {
                      setShowAddLabelInput(false);
                      setNewLabelName('');
                      setLabelError('');
                    }}
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
