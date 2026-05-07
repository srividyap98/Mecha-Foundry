// This file mirrors your Supabase schema.
// Re-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          role: 'viewer' | 'creator' | 'investor'
          location: string | null
          website: string | null
          github_url: string | null
          investor_thesis: string | null
          investor_check_size: string | null
          investor_industries: string[] | null
          investor_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      ideas: {
        Row: {
          id: string
          creator_id: string
          title: string
          problem: string
          solution: string
          stage: 'concept' | 'mvp' | 'beta' | 'launched'
          category: string
          tags: string[]
          skills_needed: string[]
          tech_stack: string[]
          collab_setting: 'open' | 'apply' | 'invite_only'
          github_url: string | null
          figma_url: string | null
          demo_url: string | null
          doc_url: string | null
          upvote_count: number
          comment_count: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ideas']['Row'], 'id' | 'created_at' | 'updated_at' | 'upvote_count' | 'comment_count'>
        Update: Partial<Database['public']['Tables']['ideas']['Insert']>
      }
      applications: {
        Row: {
          id: string
          idea_id: string
          applicant_id: string
          role_offered: string
          message: string
          portfolio_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      groups: {
        Row: {
          id: string
          idea_id: string
          name: string
          description: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['group_members']['Insert']>
      }
      group_updates: {
        Row: {
          id: string
          group_id: string
          author_id: string
          content: string
          attachments: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_updates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['group_updates']['Insert']>
      }
      milestones: {
        Row: {
          id: string
          group_id: string
          title: string
          description: string | null
          due_date: string | null
          completed: boolean
          completed_at: string | null
          order_index: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['milestones']['Row'], 'id' | 'created_at' | 'completed_at'>
        Update: Partial<Database['public']['Tables']['milestones']['Insert']>
      }
      products: {
        Row: {
          id: string
          group_id: string
          idea_id: string
          name: string
          tagline: string
          description: string
          screenshots: string[]
          demo_video_url: string | null
          live_url: string | null
          github_url: string | null
          app_store_url: string | null
          docs_url: string | null
          pricing: string | null
          is_free: boolean
          seeking_investment: boolean
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      pitches: {
        Row: {
          id: string
          product_id: string
          creator_id: string
          headline: string
          elevator_pitch: string
          traction: string
          user_count: string
          revenue: string
          timeline: string
          ask_amount: string | null
          equity_offered: string | null
          use_of_funds: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pitches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pitches']['Insert']>
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          author_id: string
          content: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      upvotes: {
        Row: { id: string; user_id: string; idea_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['upvotes']['Row'], 'id' | 'created_at'>
        Update: never
      }
      saved_ideas: {
        Row: { id: string; user_id: string; idea_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['saved_ideas']['Row'], 'id' | 'created_at'>
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      investor_messages: {
        Row: {
          id: string
          from_id: string
          to_id: string
          product_id: string
          subject: string
          body: string
          check_size: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['investor_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['investor_messages']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
