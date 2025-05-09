export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ... existing tables ...

      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_type: 'one_time' | 'recurring'
          payment_provider: 'paypal' | 'stripe'
          provider_transaction_id: string | null
          plan_code: string
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_type: 'one_time' | 'recurring'
          payment_provider: 'paypal' | 'stripe'
          provider_transaction_id?: string | null
          plan_code: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_type?: 'one_time' | 'recurring'
          payment_provider?: 'paypal' | 'stripe'
          provider_transaction_id?: string | null
          plan_code?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      paypal_settings: {
        Row: {
          id: string
          mode: 'sandbox' | 'live'
          client_id: string
          secret: string
          webhook_url: string | null
          currency: string
          payment_type: 'one_time' | 'recurring'
          subscription_plan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mode?: 'sandbox' | 'live'
          client_id: string
          secret: string
          webhook_url?: string | null
          currency?: string
          payment_type?: 'one_time' | 'recurring'
          subscription_plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mode?: 'sandbox' | 'live'
          client_id?: string
          secret?: string
          webhook_url?: string | null
          currency?: string
          payment_type?: 'one_time' | 'recurring'
          subscription_plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    // ... rest of the types ...
  }
} 