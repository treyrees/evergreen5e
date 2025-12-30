// Database types for Supabase
// Generated based on 001_community_items.sql schema

import type { CombatFeatures, RibbonFeatures, AccentColor, CreatorEmoji, Rarity } from '@/types/magic-item';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          emoji: string;
          accent_color: string;
          tickets: number;
          total_votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          emoji?: string;
          accent_color?: string;
          tickets?: number;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          emoji?: string;
          accent_color?: string;
          tickets?: number;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_items: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          base_item: string;
          attunement: boolean;
          combat: Json;
          ribbons: Json | null;
          description: string | null;
          score: number;
          suggested_rarity: string;
          creator_display_name: string;
          creator_emoji: string;
          creator_accent_color: string;
          upvotes: number;
          status: 'pending' | 'graduated';
          created_at: string;
          graduated_at: string | null;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          base_item: string;
          attunement?: boolean;
          combat: Json;
          ribbons?: Json | null;
          description?: string | null;
          score: number;
          suggested_rarity: string;
          creator_display_name: string;
          creator_emoji: string;
          creator_accent_color: string;
          upvotes?: number;
          status?: 'pending' | 'graduated';
          created_at?: string;
          graduated_at?: string | null;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          base_item?: string;
          attunement?: boolean;
          combat?: Json;
          ribbons?: Json | null;
          description?: string | null;
          score?: number;
          suggested_rarity?: string;
          creator_display_name?: string;
          creator_emoji?: string;
          creator_accent_color?: string;
          upvotes?: number;
          status?: 'pending' | 'graduated';
          created_at?: string;
          graduated_at?: string | null;
        };
      };
      votes: {
        Row: {
          id: string;
          voter_id: string;
          submission_id: string;
          vote: 'up' | 'pass';
          created_at: string;
        };
        Insert: {
          id?: string;
          voter_id: string;
          submission_id: string;
          vote: 'up' | 'pass';
          created_at?: string;
        };
        Update: {
          id?: string;
          voter_id?: string;
          submission_id?: string;
          vote?: 'up' | 'pass';
          created_at?: string;
        };
      };
      saved_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          base_item: string;
          attunement: boolean;
          combat: Json;
          ribbons: Json | null;
          special_mechanics: string | null;
          cosmetic_features: string | null;
          score: number;
          suggested_rarity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          base_item: string;
          attunement?: boolean;
          combat: Json;
          ribbons?: Json | null;
          special_mechanics?: string | null;
          cosmetic_features?: string | null;
          score: number;
          suggested_rarity: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          base_item?: string;
          attunement?: boolean;
          combat?: Json;
          ribbons?: Json | null;
          special_mechanics?: string | null;
          cosmetic_features?: string | null;
          score?: number;
          suggested_rarity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      cast_vote: {
        Args: {
          p_submission_id: string;
          p_vote: string;
        };
        Returns: Json;
      };
      submit_item: {
        Args: {
          p_name: string;
          p_base_item: string;
          p_attunement: boolean;
          p_combat: Json;
          p_ribbons: Json;
          p_description: string;
          p_score: number;
          p_suggested_rarity: string;
        };
        Returns: string;
      };
      get_items_to_vote: {
        Args: {
          p_limit?: number;
        };
        Returns: Database['public']['Tables']['community_items']['Row'][];
      };
      graduate_items: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
  };
}

// Helper type to convert database row to CommunityItem
export interface DbCommunityItem {
  id: string;
  creator_id: string;
  name: string;
  base_item: string;
  attunement: boolean;
  combat: CombatFeatures;
  ribbons: RibbonFeatures | null;
  description: string | null;
  score: number;
  suggested_rarity: Rarity;
  creator_display_name: string;
  creator_emoji: CreatorEmoji;
  creator_accent_color: AccentColor;
  upvotes: number;
  status: 'pending' | 'graduated';
  created_at: string;
  graduated_at: string | null;
}

// Helper type for user profile
export interface DbProfile {
  id: string;
  display_name: string;
  emoji: CreatorEmoji;
  accent_color: AccentColor;
  tickets: number;
  total_votes: number;
  created_at: string;
  updated_at: string;
}

// Helper type for saved items
export interface DbSavedItem {
  id: string;
  user_id: string;
  name: string;
  base_item: string;
  attunement: boolean;
  combat: CombatFeatures;
  ribbons: RibbonFeatures | null;
  special_mechanics: string | null;
  cosmetic_features: string | null;
  score: number;
  suggested_rarity: Rarity;
  created_at: string;
  updated_at: string;
}
