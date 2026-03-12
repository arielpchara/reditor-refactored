type Status = { msg: string; kind: 'ok' | 'error' | '' };

type Props = {
  filename: string;
  isDirty: boolean;
  isSaving: boolean;
  status: Status;
  onSave: () => void;
};

export const Toolbar = ({ filename, isDirty, isSaving, status, onSave }: Props): JSX.Element => (
  <div id="toolbar">
    <span id="filename">{filename}</span>
    <button id="save-btn" disabled={!isDirty || isSaving} onClick={onSave}>
      Save
    </button>
    <span id="status" className={status.kind}>
      {status.msg}
    </span>
  </div>
);
