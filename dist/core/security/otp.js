"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const crypto_1 = require("crypto");
const generateOtp = () => String((0, crypto_1.randomInt)(100000, 999999));
exports.generateOtp = generateOtp;
//# sourceMappingURL=otp.js.map