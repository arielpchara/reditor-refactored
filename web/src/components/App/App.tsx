import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor, EditorHandle } from '../Editor';
import { OtpDialog } from '../OtpDialog';
import { Toolbar } from '../Toolbar';

type AppStatus = { msg: string; kind: 'ok' | 'error' | '' };
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
  const [status, setStatus] = useState<AppStatus>({ msg: '', kind: '' });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const editorRef = useRef<EditorHandle>(null);

  const loadFileData = useCallback(async (): Promise<void> => {
    const metaRes = await fetchWithAuth('/file-meta');
    if (!metaRes.ok) {
      setErrorMsg('Failed to load file info');
      setPhase('error');
      return;
    }
    const meta = (await metaRes.json()) as { filename: string };
    setFilename(meta.filename);
    setLanguage(detectLanguage(meta.filename));
    document.title = `Reditor — ${meta.filename}`;

    const fileRes = await fetchWithAuth('/file');
    if (!fileRes.ok) {
      setErrorMsg('Failed to load file');
      setPhase('error');
      return;
    }
    setInitialContent(await fileRes.text());
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

  const handleSave = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    setStatus({ msg: 'Saving…', kind: '' });
    try {
      const res = await fetchWithAuth('/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editorRef.current?.getValue() ?? '' }),
      });
      if (res.ok) {
        setStatus({ msg: 'Saved', kind: 'ok' });
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus({ msg: body.error ?? `Error ${res.status}`, kind: 'error' });
      }
    } catch {
      setStatus({ msg: 'Network error', kind: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, []);

  if (phase === 'loading') return <div className="app__loading">Loading…</div>;
  if (phase === 'error') return <div className="app__error">Error: {errorMsg}</div>;
  if (phase === 'auth') return <OtpDialog onSuccess={() => void handleAuthSuccess()} />;

  return (
    <>
      <Toolbar
        filename={filename}
        isDirty={isDirty}
        isSaving={isSaving}
        status={status}
        onSave={() => void handleSave()}
      />
      <Editor
        ref={editorRef}
        language={language}
        initialContent={initialContent}
        onChange={() => {
          setIsDirty(true);
          setStatus({ msg: '', kind: '' });
        }}
      />
    </>
  );
}
