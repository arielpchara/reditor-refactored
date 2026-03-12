"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE_BYTES = void 0;
/** Maximum file size accepted by prism-code-editor before performance degrades.
 *  Based on the library's stated limit of ~1000 LOC on most hardware.
 *  512 KB gives comfortable headroom for files with long lines.
 */
exports.MAX_FILE_SIZE_BYTES = 524_288; // 512 KB
//# sourceMappingURL=types.js.map