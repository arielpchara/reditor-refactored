"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculate = exports.divide = exports.multiply = exports.subtract = exports.add = void 0;
const add = (a, b) => a + b;
exports.add = add;
const subtract = (a, b) => a - b;
exports.subtract = subtract;
const multiply = (a, b) => a * b;
exports.multiply = multiply;
const divide = (a, b) => {
    if (b === 0)
        throw new Error('Division by zero');
    return a / b;
};
exports.divide = divide;
const ops = {
    add: exports.add,
    subtract: exports.subtract,
    multiply: exports.multiply,
    divide: exports.divide,
};
const calculate = ({ operation, a, b }) => {
    try {
        return { ok: true, value: ops[operation](a, b) };
    }
    catch (e) {
        return { ok: false, error: e.message };
    }
};
exports.calculate = calculate;
//# sourceMappingURL=operations.js.map