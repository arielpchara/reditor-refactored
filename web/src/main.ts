import './style.css';
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

const toolbar = {
  filename: document.getElementById('filename') as HTMLSpanElement,
  saveBtn: document.getElementById('save-btn') as HTMLButtonElement,
  status: document.getElementById('status') as HTMLSpanElement,
};

const setStatus = (msg: string, kind: 'ok' | 'error' | ''): void => {
  toolbar.status.textContent = msg;
  toolbar.status.className = kind;
};

const getAuthHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem('reditor_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const exchangeOtp = async (): Promise<string | null> => {
  const otp = prompt('Enter the one-time password shown at server startup:');
  if (!otp) return null;
  const res = await fetch('/auth/exchange-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp }),
  });
  if (!res.ok) {
    alert('Invalid OTP. Please refresh and try again.');
    return null;
  }
  const data = (await res.json()) as { token: string };
  sessionStorage.setItem('reditor_token', data.token);
  return data.token;
};

const fetchWithAuth = async (url: string, init: RequestInit = {}): Promise<Response> => {
  let res = await fetch(url, { ...init, headers: { ...getAuthHeader(), ...(init.headers ?? {}) } });
  if (res.status === 401) {
    const token = await exchangeOtp();
    if (!token) throw new Error('Authentication cancelled');
    res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    });
  }
  return res;
};

const init = async (): Promise<void> => {
  // Load file metadata (filename, language hint)
  const metaRes = await fetchWithAuth('/file-meta');
  if (!metaRes.ok) {
    setStatus('Failed to load file info', 'error');
    return;
  }
  const meta = (await metaRes.json()) as { filename: string };
  const language = detectLanguage(meta.filename);
  toolbar.filename.textContent = meta.filename;
  document.title = `Reditor — ${meta.filename}`;

  // Load file content
  const fileRes = await fetchWithAuth('/file');
  if (!fileRes.ok) {
    setStatus('Failed to load file', 'error');
    return;
  }
  const content = await fileRes.text();

  // Mount editor
  const container = document.getElementById('editor-container') as HTMLDivElement;
  const editor = basicEditor(container, { language, theme: 'github-dark', value: content }, () => {
    toolbar.saveBtn.disabled = false;
    setStatus('', '');
  });

  // Save handler
  toolbar.saveBtn.addEventListener('click', async () => {
    toolbar.saveBtn.disabled = true;
    setStatus('Saving…', '');
    try {
      const res = await fetchWithAuth('/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.value }),
      });
      if (res.ok) {
        setStatus('Saved', 'ok');
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(body.error ?? `Error ${res.status}`, 'error');
      }
    } catch {
      setStatus('Network error', 'error');
    } finally {
      toolbar.saveBtn.disabled = false;
    }
  });
};

init().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  document.getElementById('editor-container')!.textContent = `Error: ${msg}`;
});
