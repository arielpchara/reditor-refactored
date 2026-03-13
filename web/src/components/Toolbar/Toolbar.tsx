import { JSX } from 'react';
import './Toolbar.css';

export type ToolbarProps = {
  filename: string;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onHistoryOpen: () => void;
};

export function Toolbar({
  filename,
  isDirty,
  isSaving,
  onSave,
  onHistoryOpen,
}: ToolbarProps): JSX.Element {
  const saveClass = ['toolbar__save', isSaving ? 'toolbar__save--saving' : ''].join(' ').trim();
  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
  const shortcut = isMac ? '⌘S' : 'Ctrl+S';
  return (
    <div className="toolbar">
      <span className="toolbar__filename" title={filename}>
        {filename}
      </span>
      <button className="toolbar__history" onClick={onHistoryOpen} aria-label="File history">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-.483 8.197.75.75 0 10-1.225.866A8 8 0 101.643 3.143z" />
          <path d="M7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z" />
        </svg>
        <span className="toolbar__tooltip">History</span>
      </button>
      <button className={saveClass} disabled={!isDirty || isSaving} onClick={onSave}>
        {isSaving ? 'Saving…' : 'Save'}
        <kbd className="toolbar__shortcut">{shortcut}</kbd>
      </button>
    </div>
  );
}
