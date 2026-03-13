import './App.css';
import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Editor, EditorHandle } from '../Editor';
import { OtpDialog } from '../OtpDialog';
import { Toolbar } from '../Toolbar';
import { Toast, ToastKind } from '../Toast';

type ToastState = { message: string; kind: ToastKind; key: number } | null;
type LoadPhase = 'loading' | 'auth' | 'ready' | 'error';

const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  json: 'json',
  html: 'html',
  xml: 'xml',
  svg: 'xml',
  css: 'css',
  scss: 'css',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  mdx: 'markdown',
  py: 'python',
  rs: 'rust',
  go: 'go',
  sql: 'sql',
};

const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_LANG[ext] ?? 'plaintext';
};

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('reditor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchWithAuth = (url: string, init: RequestInit = {}): Promise<Response> =>
  fetch(url, { ...init, headers: { ...getAuthHeader(), ...(init.headers ?? {}) } });

export function App(): JSX.Element {
  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [initialContent, setInitialContent] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const editorRef = useRef<EditorHandle>(null);
  const savedContentRef = useRef<string>('');

  const loadFileData = useCallback(async (): Promise<void> => {
    const metaRes = await fetchWithAuth('/file-meta');
    if (!metaRes.ok) {
      setErrorMsg('Failed to load file info');
      setPhase('error');
      return;
    }
    const meta = (await metaRes.json()) as { filename: string; fullpath: string };
    setFilename(meta.fullpath);
    setLanguage(detectLanguage(meta.filename));
    document.title = `Reditor — ${meta.filename}`;

    const fileRes = await fetchWithAuth('/file');
    if (!fileRes.ok) {
      setErrorMsg('Failed to load file');
      setPhase('error');
      return;
    }
    const content = await fileRes.text();
    setInitialContent(content);
    savedContentRef.current = content;
    setPhase('ready');
  }, []);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const healthRes = await fetch('/health');
        const health = (await healthRes.json()) as { status: string; securityEnabled: boolean };
        if (health.securityEnabled && !sessionStorage.getItem('reditor_token')) {
          setPhase('auth');
          return;
        }
        await loadFileData();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
        setPhase('error');
      }
    })();
  }, [loadFileData]);

  const handleAuthSuccess = useCallback(async (): Promise<void> => {
    await loadFileData();
  }, [loadFileData]);

  const showToast = useCallback((message: string, kind: ToastKind): void => {
    setToast({ message, kind, key: Date.now() });
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    const content = editorRef.current?.getValue() ?? '';
    try {
      const res = await fetchWithAuth('/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        savedContentRef.current = content;
        setIsDirty(false);
        showToast('Saved', 'ok');
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(body.error ?? `Error ${res.status}`, 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  if (phase === 'loading') return <div className="app__loading">Loading…</div>;
  if (phase === 'error') return <div className="app__error">Error: {errorMsg}</div>;
  if (phase === 'auth') return <OtpDialog onSuccess={() => void handleAuthSuccess()} />;

  return (
    <>
      <Toolbar
        filename={filename}
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => void handleSave()}
      />
      <Editor
        ref={editorRef}
        language={language}
        initialContent={initialContent}
        onChange={(value) => {
          setIsDirty(value !== savedContentRef.current);
        }}
      />
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          kind={toast.kind}
          onHide={() => setToast(null)}
        />
      )}
    </>
  );
}
