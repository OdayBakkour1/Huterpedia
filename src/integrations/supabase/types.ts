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
      ai_usage_tracking: {
        Row: {
          created_at: string
          feature_type: string
          id: string
          month_year: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type?: string
          id?: string
          month_year: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: string
          id?: string
          month_year?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          created_at: string
          date_recorded: string
          id: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          date_recorded?: string
          id?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          current_uses: number
          discount_percentage: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          current_uses?: number
          discount_percentage: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_code_id: string
          discount_amount: number
          final_amount: number
          id: string
          original_amount: number
          redeemed_at: string
          user_id: string
        }
        Insert: {
          coupon_code_id: string
          discount_amount: number
          final_amount: number
          id?: string
          original_amount: number
          redeemed_at?: string
          user_id: string
        }
        Update: {
          coupon_code_id?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          original_amount?: number
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_code_id_fkey"
            columns: ["coupon_code_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string | null
          cache_updated_at: string | null
          cached_content_url: string | null
          cached_image_url: string | null
          category: string
          content: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          published_at: string
          source: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          author?: string | null
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category: string
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at: string
          source: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          author?: string | null
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category?: string
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      news_articles_staging: {
        Row: {
          cache_updated_at: string | null
          cached_content_url: string | null
          cached_image_url: string | null
          category: string
          created_at: string
          description: string | null
          has_valid_description: boolean | null
          id: string
          image_url: string | null
          is_processed: boolean | null
          published_at: string
          source: string
          title: string
          url: string | null
        }
        Insert: {
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          has_valid_description?: boolean | null
          id?: string
          image_url?: string | null
          is_processed?: boolean | null
          published_at: string
          source: string
          title: string
          url?: string | null
        }
        Update: {
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          has_valid_description?: boolean | null
          id?: string
          image_url?: string | null
          is_processed?: boolean | null
          published_at?: string
          source?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      news_sources: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          subscribed_at: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_credits: number | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          role: string | null
          subscription: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          ai_credits?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          role?: string | null
          subscription?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          ai_credits?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          role?: string | null
          subscription?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          article_id: string
          bookmarked_at: string | null
          cache_updated_at: string | null
          cached_content_url: string | null
          cached_image_url: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          published_at: string
          source: string
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          bookmarked_at?: string | null
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at: string
          source: string
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          bookmarked_at?: string | null
          cache_updated_at?: string | null
          cached_content_url?: string | null
          cached_image_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feed_preferences: {
        Row: {
          created_at: string
          date_range_days: number | null
          id: string
          max_articles: number | null
          preferred_categories: string[] | null
          preferred_sources: string[] | null
          preferred_tags: string[] | null
          show_cached_only: boolean | null
          sort_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_range_days?: number | null
          id?: string
          max_articles?: number | null
          preferred_categories?: string[] | null
          preferred_sources?: string[] | null
          preferred_tags?: string[] | null
          show_cached_only?: boolean | null
          sort_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_range_days?: number | null
          id?: string
          max_articles?: number | null
          preferred_categories?: string[] | null
          preferred_sources?: string[] | null
          preferred_tags?: string[] | null
          show_cached_only?: boolean | null
          sort_preference?: string | null
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_monthly_usage: {
        Args: { _user_id: string; _feature_type?: string }
        Returns: {
          id: string
          usage_count: number
          month_year: string
        }[]
      }
      get_personalized_feed: {
        Args: { _user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          source: string
          url: string
          category: string
          published_at: string
          image_url: string
          cached_content_url: string
          cached_image_url: string
          cache_updated_at: string
        }[]
      }
      get_weekly_articles_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          source: string
          article_count: number
          latest_article_title: string
          latest_article_url: string
          latest_article_published_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_ai_usage: {
        Args: { _user_id: string; _feature_type?: string }
        Returns: boolean
      }
      process_staging_articles: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_staged: number
          duplicates_removed: number
          articles_processed: number
          articles_moved: number
        }[]
      }
      redeem_coupon: {
        Args: {
          _coupon_code: string
          _user_id: string
          _original_amount: number
          _discount_amount: number
          _final_amount: number
        }
        Returns: boolean
      }
      validate_and_apply_coupon: {
        Args: {
          _coupon_code: string
          _user_id: string
          _original_amount: number
        }
        Returns: {
          is_valid: boolean
          discount_percentage: number
          discount_amount: number
          final_amount: number
          error_message: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
