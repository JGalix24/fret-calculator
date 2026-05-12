export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_usage: number | null
          type: Database["public"]["Enums"]["activation_code_type"]
          usage_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_usage?: number | null
          type: Database["public"]["Enums"]["activation_code_type"]
          usage_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_usage?: number | null
          type?: Database["public"]["Enums"]["activation_code_type"]
          usage_count?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      demo_grants: {
        Row: {
          accept_language: string | null
          code_id: string | null
          created_at: string
          fingerprint_hash: string | null
          id: string
          ip_hash: string
          short_ref: string | null
          user_agent_hash: string | null
        }
        Insert: {
          accept_language?: string | null
          code_id?: string | null
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_hash: string
          short_ref?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          accept_language?: string | null
          code_id?: string | null
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_hash?: string
          short_ref?: string | null
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_grants_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          code_id: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          generated_code: string | null
          id: string
          paid_at: string | null
          plan: Database["public"]["Enums"]["activation_code_type"]
          provider: string
          provider_ref: string | null
          provider_token: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          code_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          generated_code?: string | null
          id?: string
          paid_at?: string | null
          plan: Database["public"]["Enums"]["activation_code_type"]
          provider?: string
          provider_ref?: string | null
          provider_token?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          code_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          generated_code?: string | null
          id?: string
          paid_at?: string | null
          plan?: Database["public"]["Enums"]["activation_code_type"]
          provider?: string
          provider_ref?: string | null
          provider_token?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: boolean
          landing_skin: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          landing_skin?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          landing_skin?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_code: {
        Args: {
          _password: string
          _type: Database["public"]["Enums"]["activation_code_type"]
        }
        Returns: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_usage: number | null
          type: Database["public"]["Enums"]["activation_code_type"]
          usage_count: number
        }
        SetofOptions: {
          from: "*"
          to: "activation_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_code: {
        Args: { _id: string; _password: string }
        Returns: undefined
      }
      admin_list_codes: {
        Args: { _password: string }
        Returns: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_usage: number | null
          type: Database["public"]["Enums"]["activation_code_type"]
          usage_count: number
        }[]
        SetofOptions: {
          from: "*"
          to: "activation_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_lookup_demo_ref: {
        Args: { _password: string; _short_ref: string }
        Returns: {
          code: string
          code_type: Database["public"]["Enums"]["activation_code_type"]
          expires_at: string
          found: boolean
          granted_at: string
          is_active: boolean
          max_usage: number
          short_ref: string
          usage_count: number
        }[]
      }
      admin_set_active: {
        Args: { _active: boolean; _id: string; _password: string }
        Returns: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_usage: number | null
          type: Database["public"]["Enums"]["activation_code_type"]
          usage_count: number
        }
        SetofOptions: {
          from: "*"
          to: "activation_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_set_landing_skin: {
        Args: { _password: string; _skin: string }
        Returns: string
      }
      consume_activation_code: {
        Args: { _code: string }
        Returns: {
          ok: boolean
          reason: string
          remaining: number
        }[]
      }
      get_landing_skin: { Args: never; Returns: string }
      is_admin_password: { Args: { _password: string }; Returns: boolean }
      system_attach_provider_token: {
        Args: { _payment_id: string; _token: string }
        Returns: undefined
      }
      system_create_demo_code: {
        Args: never
        Returns: {
          code: string
          code_id: string
        }[]
      }
      system_create_demo_code_for_ip: {
        Args: { _ip_hash: string }
        Returns: {
          code: string
          ok: boolean
          reason: string
        }[]
      }
      system_create_demo_code_v2: {
        Args: {
          _accept_language: string
          _fingerprint_hash: string
          _ip_hash: string
          _user_agent_hash: string
        }
        Returns: {
          code: string
          ok: boolean
          reason: string
          short_ref: string
        }[]
      }
      system_create_paid_code: {
        Args: { _payment_id: string }
        Returns: {
          code: string
          code_id: string
        }[]
      }
      system_create_pending_payment: {
        Args: {
          _amount: number
          _customer_email?: string
          _customer_name?: string
          _customer_phone?: string
          _plan: Database["public"]["Enums"]["activation_code_type"]
        }
        Returns: string
      }
      system_get_payment: {
        Args: { _payment_id: string }
        Returns: {
          amount: number
          generated_code: string
          id: string
          plan: Database["public"]["Enums"]["activation_code_type"]
          status: Database["public"]["Enums"]["payment_status"]
        }[]
      }
      system_mark_payment_status: {
        Args: {
          _payment_id: string
          _provider_ref?: string
          _status: Database["public"]["Enums"]["payment_status"]
        }
        Returns: undefined
      }
      validate_activation_code: {
        Args: { _code: string }
        Returns: {
          code_type: Database["public"]["Enums"]["activation_code_type"]
          expires_at: string
          ok: boolean
          reason: string
          remaining: number
        }[]
      }
    }
    Enums: {
      activation_code_type: "DEMO" | "MENSUEL" | "TRIMESTRIEL" | "ANNUEL"
      payment_status: "pending" | "paid" | "failed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activation_code_type: ["DEMO", "MENSUEL", "TRIMESTRIEL", "ANNUEL"],
      payment_status: ["pending", "paid", "failed", "cancelled"],
    },
  },
} as const
