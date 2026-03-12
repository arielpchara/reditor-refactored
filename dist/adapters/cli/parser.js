"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = void 0;
const VALID_OPERATIONS = ['add', 'subtract', 'multiply', 'divide'];
const parseArgs = (argv) => {
    const [, , op, rawA, rawB] = argv;
    if (!VALID_OPERATIONS.includes(op)) {
        throw new Error(`Unknown operation "${op}". Valid operations: ${VALID_OPERATIONS.join(', ')}`);
    }
    const a = Number(rawA);
    const b = Number(rawB);
    if (isNaN(a) || isNaN(b)) {
        throw new Error('Arguments <a> and <b> must be numbers');
    }
    return { operation: op, a, b };
};
exports.parseArgs = parseArgs;
//# sourceMappingURL=parser.js.map