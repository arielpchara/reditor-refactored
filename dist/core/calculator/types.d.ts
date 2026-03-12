export type Operation = 'add' | 'subtract' | 'multiply' | 'divide';
export type CalculationInput = {
    operation: Operation;
    a: number;
    b: number;
};
export type CalculationResult = {
    ok: true;
    value: number;
} | {
    ok: false;
    error: string;
};
//# sourceMappingURL=types.d.ts.map