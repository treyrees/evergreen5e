'use server';

import { createClient } from '@/lib/supabase/server';
import type { AccentColor, CreatorEmoji, Rarity, CombatFeatures, RibbonFeatures } from '@/types/magic-item';

// Result types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export interface Profile {
  id: string;
  displayName: string;
  emoji: CreatorEmoji;
  accentColor: AccentColor;
  tickets: number;
  totalVotes: number;
  createdAt: string;
}

export interface PublishedItem {
  id: string;
  name: string;
  baseItem: string;
  attunement: boolean;
  combat: CombatFeatures;
  ribbons: RibbonFeatures | null;
  description: string | null;
  score: number;
  suggestedRarity: Rarity;
  upvotes: number;
  status: 'pending' | 'graduated';
  createdAt: string;
}

export interface ProfileWithItems {
  profile: Profile;
  savedItems: Array<{
    id: string;
    name: string;
    baseItem: string;
    score: number;
    suggestedRarity: Rarity;
    createdAt: string;
  }>;
  publishedItems: PublishedItem[];
  graduatedCount: number;
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<ActionResult<Profile | null>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: true, data: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: 'Failed to fetch profile' };
    }

    return {
      success: true,
      data: {
        id: data.id,
        displayName: data.display_name,
        emoji: data.emoji as CreatorEmoji,
        accentColor: data.accent_color as AccentColor,
        tickets: data.tickets,
        totalVotes: data.total_votes,
        createdAt: data.created_at,
      },
    };
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a user's profile by display name (public)
 */
export async function getProfileByDisplayName(displayName: string): Promise<ActionResult<ProfileWithItems | null>> {
  try {
    const supabase = await createClient();

    // Get profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileData, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('display_name', displayName)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return { success: true, data: null }; // Not found
      }
      console.error('Error fetching profile:', profileError);
      return { success: false, error: 'Failed to fetch profile' };
    }

    const profile: Profile = {
      id: profileData.id,
      displayName: profileData.display_name,
      emoji: profileData.emoji as CreatorEmoji,
      accentColor: profileData.accent_color as AccentColor,
      tickets: profileData.tickets,
      totalVotes: profileData.total_votes,
      createdAt: profileData.created_at,
    };

    // Get published items (community_items)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: publishedData, error: publishedError } = await (supabase as any)
      .from('community_items')
      .select('*')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false });

    if (publishedError) {
      console.error('Error fetching published items:', publishedError);
      return { success: false, error: 'Failed to fetch published items' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishedItems: PublishedItem[] = (publishedData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      baseItem: row.base_item,
      attunement: row.attunement,
      combat: row.combat as CombatFeatures,
      ribbons: row.ribbons as RibbonFeatures | null,
      description: row.description,
      score: row.score,
      suggestedRarity: row.suggested_rarity as Rarity,
      upvotes: row.upvotes,
      status: row.status as 'pending' | 'graduated',
      createdAt: row.created_at,
    }));

    const graduatedCount = publishedItems.filter(item => item.status === 'graduated').length;

    // Check if this is the current user viewing their own profile
    const { data: { user } } = await supabase.auth.getUser();
    let savedItems: ProfileWithItems['savedItems'] = [];

    if (user && user.id === profile.id) {
      // Get saved items (only visible to the user themselves)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: savedData } = await (supabase as any)
        .from('saved_items')
        .select('id, name, base_item, score, suggested_rarity, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      savedItems = (savedData || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        baseItem: row.base_item,
        score: row.score,
        suggestedRarity: row.suggested_rarity as Rarity,
        createdAt: row.created_at,
      }));
    }

    return {
      success: true,
      data: {
        profile,
        savedItems,
        publishedItems,
        graduatedCount,
      },
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update current user's profile
 */
export async function updateProfile(data: {
  displayName?: string;
  emoji?: CreatorEmoji;
  accentColor?: AccentColor;
}): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.display_name = data.displayName;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.accentColor !== undefined) updateData.accent_color = data.accentColor;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
