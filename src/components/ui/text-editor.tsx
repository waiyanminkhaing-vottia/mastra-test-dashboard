'use client';

import Editor, { OnMount } from '@monaco-editor/react';
import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  maxHeight?: number;
  language?: string;
}

export function TextEditor({
  value,
  onChange,
  minHeight = 200,
  maxHeight = 600,
  language = 'plaintext',
}: TextEditorProps) {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [lineNumbersMinChars, setLineNumbersMinChars] = useState(2);
  const [editorHeight, setEditorHeight] = useState(minHeight);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const updateHeight = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const contentHeight = Math.min(
      maxHeight,
      Math.max(minHeight, editor.getContentHeight())
    );
    setEditorHeight(contentHeight);
  }, [minHeight, maxHeight]);

  const updateLineNumbers = useCallback(() => {
    const editor = editorRef.current;
    const model = editor?.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();
    const digits = lineCount.toString().length;
    const minChars = Math.max(2, digits + 1);

    setLineNumbersMinChars(minChars);
  }, []);

  const handleEditorDidMount: OnMount = useCallback(
    editor => {
      editorRef.current = editor;

      // Set up auto-updates
      editor.onDidContentSizeChange(updateHeight);
      editor.onDidChangeModelContent(updateLineNumbers);

      setTimeout(() => {
        updateHeight();
        updateLineNumbers();
        setIsLoaded(true);
      }, 100);
    },
    [updateHeight, updateLineNumbers]
  );

  const handleCopy = useCallback(async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed silently - user will see copy icon remains unchanged
    }
  }, [value]);

  return (
    <div className="border border-input rounded-md overflow-hidden relative">
      {!isLoaded && (
        <Skeleton
          className="w-full absolute inset-0 z-10"
          style={{ height: minHeight }}
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleCopy();
        }}
        type="button"
        className="absolute top-2 right-3 z-20 h-8 w-8 p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent hover:text-primary"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      <div className={isLoaded ? 'opacity-100' : 'opacity-0'}>
        <Editor
          height={editorHeight}
          language={language}
          value={value}
          onChange={value => onChange(value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            lineNumbersMinChars: lineNumbersMinChars,
            lineDecorationsWidth: 10,
            glyphMargin: false,
            folding: false,
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'none',
          }}
        />
      </div>
    </div>
  );
}
