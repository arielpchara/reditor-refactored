/** Maximum file size accepted by prism-code-editor before performance degrades.
 *  Based on the library's stated limit of ~1000 LOC on most hardware.
 *  512 KB gives comfortable headroom for files with long lines.
 */
export const MAX_FILE_SIZE_BYTES = 524_288; // 512 KB

export type FileContent = {
  path: string;
  content: string;
  sizeBytes: number;
};

export type FileValidationError =
  | { kind: 'NOT_FOUND'; path: string }
  | { kind: 'PATH_TRAVERSAL'; path: string }
  | { kind: 'NOT_TEXT'; path: string }
  | { kind: 'TOO_LARGE'; path: string; sizeBytes: number; maxBytes: number }
  | { kind: 'IS_DIRECTORY'; path: string }
  | { kind: 'READ_ERROR'; path: string; message: string };

export type FileResult =
  | { ok: true; file: FileContent }
  | { ok: false; error: FileValidationError };
