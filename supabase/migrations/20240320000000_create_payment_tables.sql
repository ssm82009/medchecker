-- Create enum for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create enum for payment type
CREATE TYPE payment_type AS ENUM ('one_time', 'recurring');

-- Create enum for payment provider
CREATE TYPE payment_provider AS ENUM ('paypal', 'stripe');

-- Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status transaction_status NOT NULL DEFAULT 'pending',
    payment_type payment_type NOT NULL,
    payment_provider payment_provider NOT NULL,
    provider_transaction_id VARCHAR(255),
    plan_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on user_id for faster lookups
CREATE INDEX transactions_user_id_idx ON transactions(user_id);

-- Create index on status for filtering
CREATE INDEX transactions_status_idx ON transactions(status);

-- Create index on created_at for sorting
CREATE INDEX transactions_created_at_idx ON transactions(created_at);

-- Create paypal_settings table
CREATE TABLE paypal_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mode VARCHAR(20) NOT NULL DEFAULT 'sandbox', -- 'sandbox' or 'live'
    client_id VARCHAR(255) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(255),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_type payment_type NOT NULL DEFAULT 'one_time',
    subscription_plan_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
    ON transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    ));

-- Create RLS policies for paypal_settings
ALTER TABLE paypal_settings ENABLE ROW LEVEL SECURITY;

-- Only allow admins to manage paypal settings
CREATE POLICY "Only admins can manage paypal settings"
    ON paypal_settings
    USING (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paypal_settings_updated_at
    BEFORE UPDATE ON paypal_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default paypal settings
INSERT INTO paypal_settings (mode, client_id, secret, currency, payment_type)
VALUES ('sandbox', '', '', 'USD', 'one_time'); 