import { ServiceResponse } from './service';

export interface CheckoutResult {
  orderId: number;
  paymentUrl?: string;
}

export type CheckoutResponse = ServiceResponse<CheckoutResult>;
