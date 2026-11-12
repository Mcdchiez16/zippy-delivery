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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          label: string
          lat: number | null
          lng: number | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          label: string
          lat?: number | null
          lng?: number | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      delivery_assignments: {
        Row: {
          accepted_at: string
          driver_id: string
          id: string
          order_id: string
        }
        Insert: {
          accepted_at?: string
          driver_id: string
          id?: string
          order_id: string
        }
        Update: {
          accepted_at?: string
          driver_id?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          cancel_reason: string | null
          client_request_id: string
          created_at: string
          currency: string
          customer_id: string
          distance_km: number
          driver_earnings_minor: number
          driver_id: string | null
          dropoff_summary: string
          duration_min: number
          id: string
          pickup_summary: string
          scheduled_for: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_minor: number
          tracking_code: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          cancel_reason?: string | null
          client_request_id: string
          created_at?: string
          currency?: string
          customer_id: string
          distance_km: number
          driver_earnings_minor?: number
          driver_id?: string | null
          dropoff_summary: string
          duration_min: number
          id?: string
          pickup_summary: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_minor: number
          tracking_code?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          cancel_reason?: string | null
          client_request_id?: string
          created_at?: string
          currency?: string
          customer_id?: string
          distance_km?: number
          driver_earnings_minor?: number
          driver_id?: string | null
          dropoff_summary?: string
          duration_min?: number
          id?: string
          pickup_summary?: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_minor?: number
          tracking_code?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_vehicle_type_fkey"
            columns: ["vehicle_type"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["code"]
          },
        ]
      }
      delivery_quotes: {
        Row: {
          breakdown: Json
          created_at: string
          currency: string
          id: string
          order_id: string
          total_minor: number
          vehicle_type: string
        }
        Insert: {
          breakdown: Json
          created_at?: string
          currency: string
          id?: string
          order_id: string
          total_minor: number
          vehicle_type: string
        }
        Update: {
          breakdown?: Json
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          total_minor?: number
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_status_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_stops: {
        Row: {
          address: string
          contact_name: string
          contact_phone: string
          id: string
          instructions: string | null
          kind: string
          lat: number
          lng: number
          order_id: string
          seq: number
        }
        Insert: {
          address: string
          contact_name: string
          contact_phone: string
          id?: string
          instructions?: string | null
          kind: string
          lat: number
          lng: number
          order_id: string
          seq: number
        }
        Update: {
          address?: string
          contact_name?: string
          contact_phone?: string
          id?: string
          instructions?: string | null
          kind?: string
          lat?: number
          lng?: number
          order_id?: string
          seq?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_stops_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string
          doc_type: string
          driver_id: string
          id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          driver_id: string
          id?: string
          storage_path: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          driver_id?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          emergency_contact: string | null
          full_name: string
          is_online: boolean
          last_lat: number | null
          last_lng: number | null
          license_number: string | null
          payout_account: string | null
          payout_method: string | null
          phone: string
          rating: number
          rejection_reason: string | null
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          emergency_contact?: string | null
          full_name: string
          is_online?: boolean
          last_lat?: number | null
          last_lng?: number | null
          license_number?: string | null
          payout_account?: string | null
          payout_method?: string | null
          phone: string
          rating?: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          created_at?: string
          emergency_contact?: string | null
          full_name?: string
          is_online?: boolean
          last_lat?: number | null
          last_lng?: number | null
          license_number?: string | null
          payout_account?: string | null
          payout_method?: string | null
          phone?: string
          rating?: number
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_vehicle_type_fkey"
            columns: ["vehicle_type"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["code"]
          },
        ]
      }
      packages: {
        Row: {
          category: string
          declared_value_minor: number | null
          description: string
          fragile: boolean
          height_cm: number
          id: string
          instructions: string | null
          length_cm: number
          order_id: string
          quantity: number
          weight_kg: number
          width_cm: number
        }
        Insert: {
          category: string
          declared_value_minor?: number | null
          description: string
          fragile?: boolean
          height_cm: number
          id?: string
          instructions?: string | null
          length_cm: number
          order_id: string
          quantity?: number
          weight_kg: number
          width_cm: number
        }
        Update: {
          category?: string
          declared_value_minor?: number | null
          description?: string
          fragile?: boolean
          height_cm?: number
          id?: string
          instructions?: string | null
          length_cm?: number
          order_id?: string
          quantity?: number
          weight_kg?: number
          width_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_fare_minor: number
          currency: string
          fragile_fee_minor: number
          min_fare_minor: number
          per_kg_minor: number
          per_km_minor: number
          scheduled_fee_minor: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          base_fare_minor: number
          currency?: string
          fragile_fee_minor?: number
          min_fare_minor?: number
          per_kg_minor?: number
          per_km_minor: number
          scheduled_fee_minor?: number
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          base_fare_minor?: number
          currency?: string
          fragile_fee_minor?: number
          min_fare_minor?: number
          per_kg_minor?: number
          per_km_minor?: number
          scheduled_fee_minor?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_vehicle_type_fkey"
            columns: ["vehicle_type"]
            isOneToOne: true
            referencedRelation: "vehicle_types"
            referencedColumns: ["code"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          usage_intent: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          usage_intent?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          usage_intent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          active: boolean
          allows_fragile: boolean
          code: string
          max_distance_km: number
          max_length_cm: number
          max_weight_kg: number
          name: string
          sort: number
          speed_kmh: number
          tagline: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allows_fragile?: boolean
          code: string
          max_distance_km: number
          max_length_cm: number
          max_weight_kg: number
          name: string
          sort?: number
          speed_kmh: number
          tagline: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allows_fragile?: boolean
          code?: string
          max_distance_km?: number
          max_length_cm?: number
          max_weight_kg?: number
          name?: string
          sort?: number
          speed_kmh?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          approved: boolean
          created_at: string
          driver_id: string
          id: string
          make_model: string | null
          registration: string | null
          vehicle_type: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          driver_id: string
          id?: string
          make_model?: string | null
          registration?: string | null
          vehicle_type: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          driver_id?: string
          id?: string
          make_model?: string | null
          registration?: string | null
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vehicles_vehicle_type_fkey"
            columns: ["vehicle_type"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_order: { Args: { _order_id: string }; Returns: undefined }
      admin_set_driver_status: {
        Args: {
          _driver_id: string
          _reason?: string
          _status: Database["public"]["Enums"]["driver_status"]
        }
        Returns: undefined
      }
      advance_order: {
        Args: {
          _note?: string
          _order_id: string
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      can_view_order: { Args: { _order_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_valid_transition: {
        Args: {
          _from: Database["public"]["Enums"]["order_status"]
          _to: Database["public"]["Enums"]["order_status"]
        }
        Returns: boolean
      }
      order_driver_info: {
        Args: { _order_id: string }
        Returns: {
          full_name: string
          rating: number
          registration: string
          vehicle_type: string
        }[]
      }
      register_driver: {
        Args: {
          _emergency: string
          _full_name: string
          _license: string
          _make_model: string
          _payout_account: string
          _payout_method: string
          _phone: string
          _registration: string
          _vehicle_type: string
        }
        Returns: undefined
      }
      set_driver_online: {
        Args: { _lat?: number; _lng?: number; _online: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "customer" | "driver" | "admin"
      driver_status: "pending" | "approved" | "rejected" | "suspended"
      order_status:
        | "searching"
        | "assigned"
        | "arriving_pickup"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["customer", "driver", "admin"],
      driver_status: ["pending", "approved", "rejected", "suspended"],
      order_status: [
        "searching",
        "assigned",
        "arriving_pickup",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
