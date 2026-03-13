import { JSX } from 'react';
import './Toolbar.css';

export type ToolbarProps = {
  filename: string;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
};

export function Toolbar({ filename, isDirty, isSaving, onSave }: ToolbarProps): JSX.Element {
  return (
    <div className="toolbar">
      <span className="toolbar__filename" title={filename}>
        {filename}
      </span>
      <button className="toolbar__save" disabled={!isDirty || isSaving} onClick={onSave}>
        {isSaving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
