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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availabilities: {
        Row: {
          id: string
          name: string
          slug: string
          sort: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      banners: {
        Row: {
          amount: number | null
          auto_renew: boolean
          city_id: string | null
          clicks: number
          company_id: string | null
          created_at: string
          created_by: string | null
          duration_days: number | null
          ends_at: string | null
          id: string
          image_url: string
          image_url_mobile: string | null
          impressions: number
          internal_name: string | null
          internal_notes: string | null
          is_active: boolean
          payment_method: string | null
          payment_status: string
          priority: number
          slot: Database["public"]["Enums"]["banner_slot"]
          starts_at: string | null
          status: Database["public"]["Enums"]["manual_contract_status"]
          target_url: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean
          city_id?: string | null
          clicks?: number
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          image_url: string
          image_url_mobile?: string | null
          impressions?: number
          internal_name?: string | null
          internal_notes?: string | null
          is_active?: boolean
          payment_method?: string | null
          payment_status?: string
          priority?: number
          slot: Database["public"]["Enums"]["banner_slot"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["manual_contract_status"]
          target_url: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean
          city_id?: string | null
          clicks?: number
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string
          image_url_mobile?: string | null
          impressions?: number
          internal_name?: string | null
          internal_notes?: string | null
          is_active?: boolean
          payment_method?: string | null
          payment_status?: string
          priority?: number
          slot?: Database["public"]["Enums"]["banner_slot"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["manual_contract_status"]
          target_url?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          faq: Json | null
          id: string
          is_published: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          faq?: Json | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          faq?: Json | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          approved_at: string | null
          company_id: string
          created_at: string
          creci: string | null
          disabled_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          profile_id: string | null
          rejected_at: string | null
          status: string
          updated_at: string
          verified_at: string | null
          whatsapp: string | null
        }
        Insert: {
          approved_at?: string | null
          company_id: string
          created_at?: string
          creci?: string | null
          disabled_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          approved_at?: string | null
          company_id?: string
          created_at?: string
          creci?: string | null
          disabled_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          profile_id?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          ddd: number
          geom: unknown
          ibge_code: string | null
          id: string
          intro_text: string | null
          is_featured: boolean
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          state: string
        }
        Insert: {
          created_at?: string
          ddd?: number
          geom?: unknown
          ibge_code?: string | null
          id?: string
          intro_text?: string | null
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          state?: string
        }
        Update: {
          created_at?: string
          ddd?: number
          geom?: unknown
          ibge_code?: string | null
          id?: string
          intro_text?: string | null
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          state?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          business_hours: Json | null
          city_id: string | null
          cnpj: string | null
          cover_url: string | null
          created_at: string
          creci: string | null
          description: string | null
          email: string | null
          facebook: string | null
          featured_until: string | null
          gateway_customer_id: string | null
          id: string
          instagram: string | null
          is_featured: boolean
          is_verified: boolean
          legal_name: string | null
          logo_url: string | null
          neighborhood_id: string | null
          owner_id: string
          phone: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          trade_name: string
          type: Database["public"]["Enums"]["company_type"]
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          city_id?: string | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string
          creci?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          featured_until?: string | null
          gateway_customer_id?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean
          is_verified?: boolean
          legal_name?: string | null
          logo_url?: string | null
          neighborhood_id?: string | null
          owner_id: string
          phone?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          trade_name: string
          type: Database["public"]["Enums"]["company_type"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          city_id?: string | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string
          creci?: string | null
          description?: string | null
          email?: string | null
          facebook?: string | null
          featured_until?: string | null
          gateway_customer_id?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean
          is_verified?: boolean
          legal_name?: string | null
          logo_url?: string | null
          neighborhood_id?: string | null
          owner_id?: string
          phone?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          trade_name?: string
          type?: Database["public"]["Enums"]["company_type"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_cities: {
        Row: {
          city_id: string
          company_id: string
        }
        Insert: {
          city_id: string
          company_id: string
        }
        Update: {
          city_id?: string
          company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_cities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_specialties: {
        Row: {
          company_id: string
          specialty_id: string
        }
        Insert: {
          company_id: string
          specialty_id: string
        }
        Update: {
          company_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_specialties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_status_history: {
        Row: {
          action: string
          admin_id: string | null
          contract_id: string
          contract_type: string
          created_at: string
          from_status: string | null
          id: string
          metadata: Json | null
          reason: string | null
          to_status: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          contract_id: string
          contract_type?: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          to_status?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          contract_id?: string
          contract_type?: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_status_history_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
          valid_until?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          profile_id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          property_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          category: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          channel: Database["public"]["Enums"]["lead_channel"]
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          message: string | null
          name: string
          owner_id: string | null
          phone: string | null
          property_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          user_agent: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["lead_channel"]
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          message?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          user_agent?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["lead_channel"]
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          message?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          property_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_features: {
        Row: {
          amount: number
          created_at: string
          days: number
          ends_at: string | null
          feature_type: string
          id: string
          payment_id: string | null
          property_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["feature_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          days: number
          ends_at?: string | null
          feature_type?: string
          id?: string
          payment_id?: string | null
          property_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          days?: number
          ends_at?: string | null
          feature_type?: string
          id?: string
          payment_id?: string | null
          property_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_features_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_contracts: {
        Row: {
          amount: number | null
          auto_renew: boolean
          city_scope: Json | null
          company_id: string
          created_at: string
          created_by: string | null
          duration_days: number
          ends_at: string
          id: string
          included_featured: number
          internal_notes: string | null
          max_active_listings: number
          paused_at: string | null
          payment_method: string
          payment_status: string
          plan_id: string | null
          plan_name: string
          plan_type: string | null
          public_notes: string | null
          remaining_days_snapshot: number | null
          starts_at: string
          status: Database["public"]["Enums"]["manual_contract_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean
          city_scope?: Json | null
          company_id: string
          created_at?: string
          created_by?: string | null
          duration_days: number
          ends_at: string
          id?: string
          included_featured?: number
          internal_notes?: string | null
          max_active_listings?: number
          paused_at?: string | null
          payment_method?: string
          payment_status?: string
          plan_id?: string | null
          plan_name: string
          plan_type?: string | null
          public_notes?: string | null
          remaining_days_snapshot?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["manual_contract_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean
          city_scope?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          duration_days?: number
          ends_at?: string
          id?: string
          included_featured?: number
          internal_notes?: string | null
          max_active_listings?: number
          paused_at?: string | null
          payment_method?: string
          payment_status?: string
          plan_id?: string | null
          plan_name?: string
          plan_type?: string | null
          public_notes?: string | null
          remaining_days_snapshot?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["manual_contract_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_contracts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_contracts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhoods: {
        Row: {
          city_id: string
          created_at: string
          geom: unknown
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
        }
        Insert: {
          city_id: string
          created_at?: string
          geom?: unknown
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
        }
        Update: {
          city_id?: string
          created_at?: string
          geom?: unknown
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "neighborhoods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_name: string
          gateway: string
          id: string
          payload: Json
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_name: string
          gateway?: string
          id?: string
          payload: Json
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_name?: string
          gateway?: string
          id?: string
          payload?: Json
          processed_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          boleto_url: string | null
          company_id: string | null
          created_at: string
          description: string | null
          external_reference: string | null
          gateway: string
          gateway_payload: Json | null
          gateway_payment_id: string | null
          id: string
          invoice_url: string | null
          method: Database["public"]["Enums"]["payment_method"] | null
          paid_at: string | null
          pix_qr_code: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
        }
        Insert: {
          amount: number
          boleto_url?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          external_reference?: string | null
          gateway?: string
          gateway_payload?: Json | null
          gateway_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          boleto_url?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          external_reference?: string | null
          gateway?: string
          gateway_payload?: Json | null
          gateway_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          method?: Database["public"]["Enums"]["payment_method"] | null
          paid_at?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          audience: string
          benefits: Json | null
          created_at: string
          highlight: boolean
          id: string
          included_featured: number
          interval: Database["public"]["Enums"]["plan_interval"]
          is_active: boolean
          max_active_listings: number
          name: string
          price: number
          slug: string
          sort: number
          stripe_price_id: string | null
        }
        Insert: {
          audience?: string
          benefits?: Json | null
          created_at?: string
          highlight?: boolean
          id?: string
          included_featured?: number
          interval?: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          max_active_listings: number
          name: string
          price?: number
          slug: string
          sort?: number
          stripe_price_id?: string | null
        }
        Update: {
          audience?: string
          benefits?: Json | null
          created_at?: string
          highlight?: boolean
          id?: string
          included_featured?: number
          interval?: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          max_active_listings?: number
          name?: string
          price?: number
          slug?: string
          sort?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          onboarding_data: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          role_choice_made_at: string | null
          role_intent: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          onboarding_data?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          role_choice_made_at?: string | null
          role_intent?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          onboarding_data?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          role_choice_made_at?: string | null
          role_intent?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          accepts_exchange: boolean | null
          accepts_financing: boolean | null
          accepts_mcmv: boolean
          availability: string
          bathrooms: number | null
          bedrooms: number | null
          boosted_until: string | null
          broker_id: string | null
          built_area: number | null
          city_id: string
          company_id: string | null
          complement: string | null
          condition: string | null
          condo_fee: number | null
          condo_name: string | null
          contact_company: string | null
          contact_email: string | null
          contact_methods: string[]
          contact_name: string | null
          contact_phone: string | null
          contact_pref: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          featured_until: string | null
          floor: number | null
          furnished: string | null
          garages: number | null
          geom: unknown
          hide_exact_location: boolean
          id: string
          iptu: number | null
          is_featured: boolean
          land_area: number | null
          latitude: number | null
          lead_email: string | null
          leads_count: number
          longitude: number | null
          negotiable: boolean
          negotiation: Database["public"]["Enums"]["negotiation_type"]
          neighborhood_id: string | null
          number: string | null
          owner_id: string
          price: number | null
          price_visibility: Database["public"]["Enums"]["price_visibility"]
          property_type_id: string
          published_at: string | null
          reference_code: string | null
          short_description: string | null
          show_phone: boolean
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          street: string | null
          suites: number | null
          title: string
          total_floors: number | null
          tour_url: string | null
          updated_at: string
          video_url: string | null
          views_count: number
          zipcode: string | null
        }
        Insert: {
          accepts_exchange?: boolean | null
          accepts_financing?: boolean | null
          accepts_mcmv?: boolean
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          boosted_until?: string | null
          broker_id?: string | null
          built_area?: number | null
          city_id: string
          company_id?: string | null
          complement?: string | null
          condition?: string | null
          condo_fee?: number | null
          condo_name?: string | null
          contact_company?: string | null
          contact_email?: string | null
          contact_methods?: string[]
          contact_name?: string | null
          contact_phone?: string | null
          contact_pref?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          floor?: number | null
          furnished?: string | null
          garages?: number | null
          geom?: unknown
          hide_exact_location?: boolean
          id?: string
          iptu?: number | null
          is_featured?: boolean
          land_area?: number | null
          latitude?: number | null
          lead_email?: string | null
          leads_count?: number
          longitude?: number | null
          negotiable?: boolean
          negotiation: Database["public"]["Enums"]["negotiation_type"]
          neighborhood_id?: string | null
          number?: string | null
          owner_id: string
          price?: number | null
          price_visibility?: Database["public"]["Enums"]["price_visibility"]
          property_type_id: string
          published_at?: string | null
          reference_code?: string | null
          short_description?: string | null
          show_phone?: boolean
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          street?: string | null
          suites?: number | null
          title: string
          total_floors?: number | null
          tour_url?: string | null
          updated_at?: string
          video_url?: string | null
          views_count?: number
          zipcode?: string | null
        }
        Update: {
          accepts_exchange?: boolean | null
          accepts_financing?: boolean | null
          accepts_mcmv?: boolean
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          boosted_until?: string | null
          broker_id?: string | null
          built_area?: number | null
          city_id?: string
          company_id?: string | null
          complement?: string | null
          condition?: string | null
          condo_fee?: number | null
          condo_name?: string | null
          contact_company?: string | null
          contact_email?: string | null
          contact_methods?: string[]
          contact_name?: string | null
          contact_phone?: string | null
          contact_pref?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          floor?: number | null
          furnished?: string | null
          garages?: number | null
          geom?: unknown
          hide_exact_location?: boolean
          id?: string
          iptu?: number | null
          is_featured?: boolean
          land_area?: number | null
          latitude?: number | null
          lead_email?: string | null
          leads_count?: number
          longitude?: number | null
          negotiable?: boolean
          negotiation?: Database["public"]["Enums"]["negotiation_type"]
          neighborhood_id?: string | null
          number?: string | null
          owner_id?: string
          price?: number | null
          price_visibility?: Database["public"]["Enums"]["price_visibility"]
          property_type_id?: string
          published_at?: string | null
          reference_code?: string | null
          short_description?: string | null
          show_phone?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          street?: string | null
          suites?: number | null
          title?: string
          total_floors?: number | null
          tour_url?: string | null
          updated_at?: string
          video_url?: string | null
          views_count?: number
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availabilities: {
        Row: {
          availability_id: string
          property_id: string
        }
        Insert: {
          availability_id: string
          property_id: string
        }
        Update: {
          availability_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_availabilities_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "availabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_availabilities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_features: {
        Row: {
          feature_id: string
          property_id: string
        }
        Insert: {
          feature_id: string
          property_id: string
        }
        Update: {
          feature_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          is_cover: boolean
          property_id: string
          sort: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          property_id: string
          sort?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          is_cover?: boolean
          property_id?: string
          sort?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_negotiations: {
        Row: {
          created_at: string
          is_primary: boolean
          negotiation: Database["public"]["Enums"]["negotiation_type"]
          price: number | null
          price_visibility: Database["public"]["Enums"]["price_visibility"]
          property_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          is_primary?: boolean
          negotiation: Database["public"]["Enums"]["negotiation_type"]
          price?: number | null
          price_visibility?: Database["public"]["Enums"]["price_visibility"]
          property_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          is_primary?: boolean
          negotiation?: Database["public"]["Enums"]["negotiation_type"]
          price?: number | null
          price_visibility?: Database["public"]["Enums"]["price_visibility"]
          property_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_negotiations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          icon: string | null
          id: string
          name: string
          slug: string
          sort: number
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort?: number
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          faq: Json | null
          h1: string | null
          id: string
          intro_html: string | null
          is_indexable: boolean
          meta_description: string | null
          path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          faq?: Json | null
          h1?: string | null
          id?: string
          intro_html?: string | null
          is_indexable?: boolean
          meta_description?: string | null
          path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          faq?: Json | null
          h1?: string | null
          id?: string
          intro_html?: string | null
          is_indexable?: boolean
          meta_description?: string | null
          path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      specialties: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      storefront_activations: {
        Row: {
          amount: number
          created_at: string
          days: number
          ends_at: string | null
          id: string
          payment_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["feature_status"]
          storefront_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          days: number
          ends_at?: string | null
          id?: string
          payment_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          storefront_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          days?: number
          ends_at?: string | null
          id?: string
          payment_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          storefront_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storefront_activations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storefront_activations_storefront_id_fkey"
            columns: ["storefront_id"]
            isOneToOne: false
            referencedRelation: "storefronts"
            referencedColumns: ["id"]
          },
        ]
      }
      storefronts: {
        Row: {
          about: string | null
          accent_color: string | null
          activated_at: string | null
          company_id: string
          cover_url: string | null
          created_at: string
          expires_at: string | null
          headline: string | null
          id: string
          logo_url: string | null
          show_whatsapp: boolean
          slug: string
          status: Database["public"]["Enums"]["feature_status"]
          updated_at: string
          views_count: number
        }
        Insert: {
          about?: string | null
          accent_color?: string | null
          activated_at?: string | null
          company_id: string
          cover_url?: string | null
          created_at?: string
          expires_at?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          show_whatsapp?: boolean
          slug: string
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
          views_count?: number
        }
        Update: {
          about?: string | null
          accent_color?: string | null
          activated_at?: string | null
          company_id?: string
          cover_url?: string | null
          created_at?: string
          expires_at?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          show_whatsapp?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "storefronts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          company_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          custom_plan_name: string | null
          featured_override: number | null
          gateway: string
          gateway_customer_id: string | null
          gateway_subscription_id: string | null
          id: string
          manual_contract_id: string | null
          max_listings_override: number | null
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          company_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          custom_plan_name?: string | null
          featured_override?: number | null
          gateway?: string
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          manual_contract_id?: string | null
          max_listings_override?: number | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          custom_plan_name?: string | null
          featured_override?: number | null
          gateway?: string
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          manual_contract_id?: string | null
          max_listings_override?: number | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_manual_contract_id_fkey"
            columns: ["manual_contract_id"]
            isOneToOne: false
            referencedRelation: "manual_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      properties_within_radius: {
        Args: { center_lat: number; center_lng: number; radius_km: number }
        Returns: {
          accepts_exchange: boolean | null
          accepts_financing: boolean | null
          accepts_mcmv: boolean
          availability: string
          bathrooms: number | null
          bedrooms: number | null
          boosted_until: string | null
          broker_id: string | null
          built_area: number | null
          city_id: string
          company_id: string | null
          complement: string | null
          condition: string | null
          condo_fee: number | null
          condo_name: string | null
          contact_company: string | null
          contact_email: string | null
          contact_methods: string[]
          contact_name: string | null
          contact_phone: string | null
          contact_pref: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          featured_until: string | null
          floor: number | null
          furnished: string | null
          garages: number | null
          geom: unknown
          hide_exact_location: boolean
          id: string
          iptu: number | null
          is_featured: boolean
          land_area: number | null
          latitude: number | null
          lead_email: string | null
          leads_count: number
          longitude: number | null
          negotiable: boolean
          negotiation: Database["public"]["Enums"]["negotiation_type"]
          neighborhood_id: string | null
          number: string | null
          owner_id: string
          price: number | null
          price_visibility: Database["public"]["Enums"]["price_visibility"]
          property_type_id: string
          published_at: string | null
          reference_code: string | null
          short_description: string | null
          show_phone: boolean
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          street: string | null
          suites: number | null
          title: string
          total_floors: number | null
          tour_url: string | null
          updated_at: string
          video_url: string | null
          views_count: number
          zipcode: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "properties"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      banner_slot:
        | "home_topo"
        | "home_meio"
        | "busca_lateral"
        | "busca_lista"
        | "imovel_rodape"
        | "empresa_pagina"
        | "blog"
      company_type:
        | "imobiliaria"
        | "corretor_autonomo"
        | "construtora"
        | "engenharia_civil"
        | "arquitetura"
        | "topografia"
        | "incorporadora"
        | "material_construcao"
        | "energia_solar"
        | "seguranca"
        | "financiamento"
        | "pintura"
        | "pedreiro"
        | "eletrica"
        | "hidraulica"
        | "outro"
      feature_status: "ativo" | "expirado" | "pendente_pagamento"
      lead_channel: "formulario" | "whatsapp" | "telefone" | "ligacao"
      lead_status:
        | "novo"
        | "em_contato"
        | "visita"
        | "proposta"
        | "fechado"
        | "perdido"
      listing_status:
        | "rascunho"
        | "ativo"
        | "pausado"
        | "arquivado"
        | "em_moderacao"
        | "reprovado"
      manual_contract_status:
        | "agendado"
        | "ativo"
        | "pausado"
        | "cancelado"
        | "expirado"
      negotiation_type:
        | "venda"
        | "aluguel"
        | "temporada"
        | "lancamento"
        | "romaria"
      payment_method: "pix" | "boleto" | "cartao_credito"
      payment_status: "pendente" | "pago" | "estornado" | "falhou" | "cancelado"
      plan_interval: "mensal" | "anual" | "unico"
      price_visibility: "publico" | "sob_consulta"
      subscription_status:
        | "ativa"
        | "pendente"
        | "inadimplente"
        | "cancelada"
        | "trial"
      user_role: "particular" | "profissional" | "admin" | "moderador"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      banner_slot: [
        "home_topo",
        "home_meio",
        "busca_lateral",
        "busca_lista",
        "imovel_rodape",
        "empresa_pagina",
        "blog",
      ],
      company_type: [
        "imobiliaria",
        "corretor_autonomo",
        "construtora",
        "engenharia_civil",
        "arquitetura",
        "topografia",
        "incorporadora",
        "material_construcao",
        "energia_solar",
        "seguranca",
        "financiamento",
        "pintura",
        "pedreiro",
        "eletrica",
        "hidraulica",
        "outro",
      ],
      feature_status: ["ativo", "expirado", "pendente_pagamento"],
      lead_channel: ["formulario", "whatsapp", "telefone", "ligacao"],
      lead_status: [
        "novo",
        "em_contato",
        "visita",
        "proposta",
        "fechado",
        "perdido",
      ],
      listing_status: [
        "rascunho",
        "ativo",
        "pausado",
        "arquivado",
        "em_moderacao",
        "reprovado",
      ],
      manual_contract_status: [
        "agendado",
        "ativo",
        "pausado",
        "cancelado",
        "expirado",
      ],
      negotiation_type: [
        "venda",
        "aluguel",
        "temporada",
        "lancamento",
        "romaria",
      ],
      payment_method: ["pix", "boleto", "cartao_credito"],
      payment_status: ["pendente", "pago", "estornado", "falhou", "cancelado"],
      plan_interval: ["mensal", "anual", "unico"],
      price_visibility: ["publico", "sob_consulta"],
      subscription_status: [
        "ativa",
        "pendente",
        "inadimplente",
        "cancelada",
        "trial",
      ],
      user_role: ["particular", "profissional", "admin", "moderador"],
    },
  },
} as const
