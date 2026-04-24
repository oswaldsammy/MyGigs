// PAYMENT GATEWAY — TO BE INTEGRATED
// All functions below are intentionally empty placeholders until the gateway
// API key and integration details are provided.

export const initializePayment = async (_bookingId: string, _amount: number): Promise<void> => {};

export const capturePayment = async (_bookingId: string): Promise<void> => {};

export const releasePayout = async (_bookingId: string): Promise<void> => {};

export const refundPayment = async (_bookingId: string): Promise<void> => {};

export const getPaymentStatus = async (_bookingId: string): Promise<null> => null;
