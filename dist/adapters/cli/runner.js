"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const operations_1 = require("../../core/calculator/operations");
const runCommand = (args) => {
    const result = (0, operations_1.calculate)(args);
    return result.ok ? String(result.value) : `Error: ${result.error}`;
};
exports.runCommand = runCommand;
//# sourceMappingURL=runner.js.map