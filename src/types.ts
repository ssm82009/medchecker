export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentType = 'one_time' | 'recurring';
export type PaymentProvider = 'paypal' | 'stripe';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    payment_type: PaymentType;
    payment_provider: PaymentProvider;
    provider_transaction_id?: string;
    plan_code: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
}

export interface PayPalSettings {
    id: string;
    mode: 'sandbox' | 'live';
    client_id: string;
    secret: string;
    webhook_url?: string;
    currency: string;
    payment_type: PaymentType;
    subscription_plan_id?: string;
    created_at: string;
    updated_at: string;
} 