import { uddoktaPayConfig } from './config';

export function parseQueryParams(url: string): Record<string, string> {
  const queryString = url.split('?')[1] ?? '';
  const params: Record<string, string> = {};
  for (const pair of queryString.split('&')) {
    if (!pair) continue;
    const [key, value] = pair.split('=');
    if (!key) continue;
    params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
  }
  return params;
}

interface CreateChargeInput {
  fullName: string;
  email: string;
  amount: number;
  metadata?: Record<string, string>;
}

interface CreateChargeResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

export async function createCharge(input: CreateChargeInput): Promise<CreateChargeResponse> {
  const res = await fetch(`${uddoktaPayConfig.apiBaseUrl}/checkout-v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'RT-UDDOKTAPAY-API-KEY': uddoktaPayConfig.apiKey,
    },
    body: JSON.stringify({
      full_name: input.fullName,
      email: input.email,
      amount: input.amount.toFixed(2),
      metadata: input.metadata ?? {},
      redirect_url: uddoktaPayConfig.redirectUrl,
      return_type: 'GET',
      cancel_url: uddoktaPayConfig.cancelUrl,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || 'পেমেন্ট শুরু করা যায়নি');
  }
  return data;
}

export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'ERROR';

export interface VerifyPaymentResponse {
  full_name: string;
  email: string;
  amount: string;
  fee: string;
  charged_amount: string;
  invoice_id: string;
  metadata: Record<string, unknown>;
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  date: string;
  status: PaymentStatus;
}

export async function verifyPayment(invoiceId: string): Promise<VerifyPaymentResponse> {
  const res = await fetch(`${uddoktaPayConfig.apiBaseUrl}/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'RT-UDDOKTAPAY-API-KEY': uddoktaPayConfig.apiKey,
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });
  const data = await res.json();
  if (!res.ok || !data.invoice_id) {
    throw new Error(data.message || 'পেমেন্টের অবস্থা যাচাই করা যায়নি');
  }
  return data;
}
