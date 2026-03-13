import './Editor.css';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import 'prism-code-editor/prism/languages/markup';
import 'prism-code-editor/prism/languages/css';
import 'prism-code-editor/prism/languages/javascript';
import 'prism-code-editor/prism/languages/typescript';
import 'prism-code-editor/prism/languages/jsx';
import 'prism-code-editor/prism/languages/tsx';
import 'prism-code-editor/prism/languages/json';
import 'prism-code-editor/prism/languages/bash';
import 'prism-code-editor/prism/languages/yaml';
import 'prism-code-editor/prism/languages/markdown';
import 'prism-code-editor/prism/languages/python';
import 'prism-code-editor/prism/languages/rust';
import 'prism-code-editor/prism/languages/go';
import 'prism-code-editor/prism/languages/sql';
import { basicEditor } from 'prism-code-editor/setups';

export type EditorHandle = {
  getValue: () => string;
};

export type EditorProps = {
  language: string;
  initialContent: string;
  onChange: (value: string) => void;
};

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { language, initialContent, onChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<ReturnType<typeof basicEditor> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    editorInstanceRef.current = basicEditor(
      containerRef.current,
      { language, theme: 'github-dark', value: initialContent },
      () => onChange(editorInstanceRef.current?.value ?? ''),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once only

  useImperativeHandle(ref, () => ({
    getValue: () => editorInstanceRef.current?.value ?? '',
  }));

  return <div ref={containerRef} className="editor" />;
});
