// Database types for Supabase
// Updated for certifications schema (004_certifications.sql)

import type { CombatFeatures, RibbonFeatures, Rarity } from '@/types/magic-item';

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
      certifications: {
        Row: {
          id: string;
          user_id: string | null;
          item_name: string;
          creator_name: string | null;
          base_item: string;
          attunement: boolean;
          score: number;
          suggested_rarity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          item_name: string;
          creator_name?: string | null;
          base_item: string;
          attunement?: boolean;
          score: number;
          suggested_rarity: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          item_name?: string;
          creator_name?: string | null;
          base_item?: string;
          attunement?: boolean;
          score?: number;
          suggested_rarity?: string;
          created_at?: string;
        };
      };
    };
    Functions: Record<string, never>;
  };
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

// Helper type for certifications
export interface DbCertification {
  id: string;
  user_id: string | null;
  item_name: string;
  creator_name: string | null;
  flavor_text: string | null;
  base_item: string;
  attunement: boolean;
  combat: CombatFeatures;
  ribbons: RibbonFeatures | null;
  score: number;
  suggested_rarity: Rarity;
  created_at: string;
}
