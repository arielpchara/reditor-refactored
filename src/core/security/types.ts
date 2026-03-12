export type Otp = string;

export type SecurityConfig = {
  enabled: boolean;
  otp: Otp | undefined;
};
