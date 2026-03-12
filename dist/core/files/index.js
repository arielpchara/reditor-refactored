"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FILE_SIZE_BYTES = exports.validateFile = exports.isWithinSizeLimit = exports.isWithinRoot = exports.isTextBuffer = exports.writeFile = exports.readFile = void 0;
var reader_1 = require("./reader");
Object.defineProperty(exports, "readFile", { enumerable: true, get: function () { return reader_1.readFile; } });
var writer_1 = require("./writer");
Object.defineProperty(exports, "writeFile", { enumerable: true, get: function () { return writer_1.writeFile; } });
var validator_1 = require("./validator");
Object.defineProperty(exports, "isTextBuffer", { enumerable: true, get: function () { return validator_1.isTextBuffer; } });
Object.defineProperty(exports, "isWithinRoot", { enumerable: true, get: function () { return validator_1.isWithinRoot; } });
Object.defineProperty(exports, "isWithinSizeLimit", { enumerable: true, get: function () { return validator_1.isWithinSizeLimit; } });
Object.defineProperty(exports, "validateFile", { enumerable: true, get: function () { return validator_1.validateFile; } });
var types_1 = require("./types");
Object.defineProperty(exports, "MAX_FILE_SIZE_BYTES", { enumerable: true, get: function () { return types_1.MAX_FILE_SIZE_BYTES; } });
//# sourceMappingURL=index.js.map