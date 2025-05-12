export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appearance_settings: {
        Row: {
          background_color: string
          created_at: string
          font_family: string
          footer_color: string
          id: number
          logo_icon: string
          logo_text: string
          navbar_color: string
          primary_color: string
          secondary_color: string
          text_color: string
          theme: Database["public"]["Enums"]["theme_type"]
          updated_at: string
        }
        Insert: {
          background_color?: string
          created_at?: string
          font_family?: string
          footer_color?: string
          id?: number
          logo_icon?: string
          logo_text?: string
          navbar_color?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          theme?: Database["public"]["Enums"]["theme_type"]
          updated_at?: string
        }
        Update: {
          background_color?: string
          created_at?: string
          font_family?: string
          footer_color?: string
          id?: number
          logo_icon?: string
          logo_text?: string
          navbar_color?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          theme?: Database["public"]["Enums"]["theme_type"]
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content_ar: string
          content_en: string
          id: number
          last_updated: string | null
          page_key: string
          title_ar: string
          title_en: string
        }
        Insert: {
          content_ar: string
          content_en: string
          id?: number
          last_updated?: string | null
          page_key: string
          title_ar: string
          title_en: string
        }
        Update: {
          content_ar?: string
          content_en?: string
          id?: number
          last_updated?: string | null
          page_key?: string
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      paypal_settings: {
        Row: {
          created_at: string
          currency: string
          id: string
          live_client_id: string | null
          live_secret: string | null
          mode: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          sandbox_client_id: string | null
          sandbox_secret: string | null
          subscription_plan_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          live_client_id?: string | null
          live_secret?: string | null
          mode?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          sandbox_client_id?: string | null
          sandbox_secret?: string | null
          subscription_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          live_client_id?: string | null
          live_secret?: string | null
          mode?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          sandbox_client_id?: string | null
          sandbox_secret?: string | null
          subscription_plan_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          description: string | null
          description_ar: string | null
          features: string[] | null
          features_ar: string[] | null
          id: string
          is_default: boolean | null
          name: string
          name_ar: string
          price: number
        }
        Insert: {
          code: string
          description?: string | null
          description_ar?: string | null
          features?: string[] | null
          features_ar?: string[] | null
          id?: string
          is_default?: boolean | null
          name: string
          name_ar: string
          price?: number
        }
        Update: {
          code?: string
          description?: string | null
          description_ar?: string | null
          features?: string[] | null
          features_ar?: string[] | null
          id?: string
          is_default?: boolean | null
          name?: string
          name_ar?: string
          price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          search_query: string
          search_results: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          search_query: string
          search_results?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          search_query?: string
          search_results?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          type: string
          value: Json
        }
        Insert: {
          id?: number
          type: string
          value: Json
        }
        Update: {
          id?: number
          type?: string
          value?: Json
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_type: Database["public"]["Enums"]["payment_type"]
          plan_code: string
          provider_transaction_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider: Database["public"]["Enums"]["payment_provider"]
          payment_type: Database["public"]["Enums"]["payment_type"]
          plan_code: string
          provider_transaction_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_provider?: Database["public"]["Enums"]["payment_provider"]
          payment_type?: Database["public"]["Enums"]["payment_type"]
          plan_code?: string
          provider_transaction_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_uid: string
          email: string
          id: number
          password: string
          plan_code: string | null
          plan_expiry_date: string | null
          role: string
        }
        Insert: {
          auth_uid: string
          email: string
          id?: number
          password: string
          plan_code?: string | null
          plan_expiry_date?: string | null
          role?: string
        }
        Update: {
          auth_uid?: string
          email?: string
          id?: number
          password?: string
          plan_code?: string | null
          plan_expiry_date?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_appearance_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          background_color: string
          created_at: string
          font_family: string
          footer_color: string
          id: number
          logo_icon: string
          logo_text: string
          navbar_color: string
          primary_color: string
          secondary_color: string
          text_color: string
          theme: Database["public"]["Enums"]["theme_type"]
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      payment_provider: "paypal" | "stripe"
      payment_type: "one_time" | "recurring"
      theme_type: "light" | "dark" | "purple" | "blue" | "green"
      transaction_status: "pending" | "completed" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_provider: ["paypal", "stripe"],
      payment_type: ["one_time", "recurring"],
      theme_type: ["light", "dark", "purple", "blue", "green"],
      transaction_status: ["pending", "completed", "failed", "refunded"],
    },
  },
} as const
