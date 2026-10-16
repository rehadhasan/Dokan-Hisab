export interface UddoktaPayConfig {
  apiBaseUrl: string;
  apiKey: string;
  redirectUrl: string;
  cancelUrl: string;
}

const SANDBOX_API_BASE_URL = 'https://sandbox.uddoktapay.com/api';
const SANDBOX_API_KEY = '982d381360a69d419689740d9f2e26ce36fb7a50';

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// Real credentials come from the gitignored .env (EXPO_PUBLIC_UDDOKTAPAY_*),
// falling back to UddoktaPay's public sandbox when absent.
export const uddoktaPayConfig: UddoktaPayConfig = {
  apiBaseUrl: stripTrailingSlash(process.env.EXPO_PUBLIC_UDDOKTAPAY_BASE_URL || SANDBOX_API_BASE_URL),
  apiKey: process.env.EXPO_PUBLIC_UDDOKTAPAY_API_KEY || SANDBOX_API_KEY,
  redirectUrl: 'https://dokanhisab.app/uddoktapay-callback',
  cancelUrl: 'https://dokanhisab.app/uddoktapay-cancel',
};

export const isUddoktaPaySandbox = (): boolean => uddoktaPayConfig.apiBaseUrl.includes('sandbox.uddoktapay.com');
