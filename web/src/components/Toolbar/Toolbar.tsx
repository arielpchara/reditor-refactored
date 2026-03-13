import './Toolbar.css';

type StatusKind = 'ok' | 'error' | '';

export type ToolbarProps = {
  filename: string;
  isDirty: boolean;
  isSaving: boolean;
  status: { msg: string; kind: StatusKind };
  onSave: () => void;
};

export function Toolbar({ filename, isDirty, isSaving, status, onSave }: ToolbarProps): JSX.Element {
  const statusClass = `toolbar__status${status.kind ? ` toolbar__status--${status.kind}` : ''}`;

  return (
    <div className="toolbar">
      <span className="toolbar__filename">{filename}</span>
      <button className="toolbar__save" disabled={!isDirty || isSaving} onClick={onSave}>
        Save
      </button>
      <span className={statusClass}>{status.msg}</span>
    </div>
  );
}
