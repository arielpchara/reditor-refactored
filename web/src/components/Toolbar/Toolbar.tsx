import { JSX } from 'react';
import './Toolbar.css';

export type ToolbarProps = {
  filename: string;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
};

export function Toolbar({ filename, isDirty, isSaving, onSave }: ToolbarProps): JSX.Element {
  const saveClass = ['toolbar__save', isSaving ? 'toolbar__save--saving' : ''].join(' ').trim();
  return (
    <div className="toolbar">
      <span className="toolbar__filename" title={filename}>
        {filename}
      </span>
      <button className={saveClass} disabled={!isDirty || isSaving} onClick={onSave}>
        {isSaving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
