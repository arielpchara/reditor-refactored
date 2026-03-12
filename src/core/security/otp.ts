import { randomInt } from 'crypto';
import { Otp } from './types';

export const generateOtp = (): Otp => String(randomInt(100000, 999999));
