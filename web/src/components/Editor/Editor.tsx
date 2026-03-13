import './Editor.css';
import { JSX, useEffect, useRef } from 'react';
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

export type EditorProps = {
  language: string;
  /** Current content. External changes (e.g. restore) are synced into the editor. */
  value: string;
  onChange: (value: string) => void;
};

export function Editor({ language, value, onChange }: EditorProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<ReturnType<typeof basicEditor> | null>(null);

  // Mount the editor once with the initial value.
  useEffect(() => {
    if (!containerRef.current) return;
    editorInstanceRef.current = basicEditor(containerRef.current, {
      language,
      theme: 'github-dark',
      value,
      lineNumbers: true,
      onUpdate(v) {
        onChange(v);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. history restore) into the editor.
  // Skip when the value already matches to avoid disrupting normal typing.
  useEffect(() => {
    const editor = editorInstanceRef.current;
    if (!editor || editor.value === value) return;
    editor.textarea.value = value;
    editor.textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }, [value]);

  return <div ref={containerRef} className="editor" />;
}
