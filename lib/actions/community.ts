'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CombatFeatures, RibbonFeatures, Rarity, CommunityItem, AccentColor, CreatorEmoji } from '@/types/magic-item';

// Result types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export interface PublishItemInput {
  savedItemId: string; // ID of the saved item to publish
}

export interface VoteResult {
  earnedTicket: boolean;
  totalVotes: number;
}

/**
 * Publish a saved item to the community (costs 1 ticket)
 */
export async function publishItem(input: PublishItemInput): Promise<ActionResult<{ itemId: string }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get the saved item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savedItem, error: itemError } = await (supabase as any)
      .from('saved_items')
      .select('*')
      .eq('id', input.savedItemId)
      .eq('user_id', user.id)
      .single();

    if (itemError || !savedItem) {
      return { success: false, error: 'Saved item not found' };
    }

    // Call the submit_item function (handles ticket check and deduction)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: itemId, error: submitError } = await (supabase as any)
      .rpc('submit_item', {
        p_name: savedItem.name,
        p_base_item: savedItem.base_item,
        p_attunement: savedItem.attunement,
        p_combat: savedItem.combat,
        p_ribbons: savedItem.ribbons || {},
        p_description: savedItem.special_mechanics || '',
        p_score: savedItem.score,
        p_suggested_rarity: savedItem.suggested_rarity,
      });

    if (submitError) {
      console.error('Error publishing item:', submitError);
      if (submitError.message?.includes('No tickets')) {
        return { success: false, error: 'No tickets available. Vote on items to earn tickets!' };
      }
      return { success: false, error: 'Failed to publish item' };
    }

    revalidatePath('/profile');
    revalidatePath('/vote');
    return { success: true, data: { itemId } };
  } catch (err) {
    console.error('Unexpected error publishing item:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get items for voting (excludes user's own items and already voted)
 */
export async function getItemsToVote(limit: number = 3): Promise<ActionResult<CommunityItem[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Call the get_items_to_vote function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc('get_items_to_vote', { p_limit: limit });

    if (error) {
      console.error('Error fetching items to vote:', error);
      return { success: false, error: 'Failed to fetch items' };
    }

    // Transform to CommunityItem format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: CommunityItem[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      baseItem: row.base_item,
      attunement: row.attunement,
      combat: row.combat as CombatFeatures,
      ribbons: row.ribbons as RibbonFeatures,
      description: row.description,
      score: row.score,
      suggestedRarity: row.suggested_rarity as Rarity,
      creatorId: row.creator_id,
      creatorDisplayName: row.creator_display_name,
      creatorEmoji: row.creator_emoji as CreatorEmoji,
      creatorAccentColor: row.creator_accent_color as AccentColor,
      upvotes: row.upvotes,
      status: row.status as 'pending' | 'graduated',
      createdAt: row.created_at,
      graduatedAt: row.graduated_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error('Unexpected error fetching items:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Cast a vote on an item
 */
export async function castVote(
  submissionId: string,
  vote: 'up' | 'pass'
): Promise<ActionResult<VoteResult>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Call the cast_vote function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc('cast_vote', {
        p_submission_id: submissionId,
        p_vote: vote,
      });

    if (error) {
      console.error('Error casting vote:', error);
      if (error.message?.includes('Cannot vote on your own')) {
        return { success: false, error: 'Cannot vote on your own submission' };
      }
      if (error.message?.includes('duplicate')) {
        return { success: false, error: 'Already voted on this item' };
      }
      return { success: false, error: 'Failed to cast vote' };
    }

    revalidatePath('/vote');
    revalidatePath('/profile');

    return {
      success: true,
      data: {
        earnedTicket: data.earned_ticket,
        totalVotes: data.total_votes,
      },
    };
  } catch (err) {
    console.error('Unexpected error casting vote:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get graduated items for the Evergreen Collection
 */
export async function getGraduatedItems(): Promise<ActionResult<CommunityItem[]>> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('community_items')
      .select('*')
      .eq('status', 'graduated')
      .order('graduated_at', { ascending: false });

    if (error) {
      console.error('Error fetching graduated items:', error);
      return { success: false, error: 'Failed to fetch items' };
    }

    // Transform to CommunityItem format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: CommunityItem[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      baseItem: row.base_item,
      attunement: row.attunement,
      combat: row.combat as CombatFeatures,
      ribbons: row.ribbons as RibbonFeatures,
      description: row.description,
      score: row.score,
      suggestedRarity: row.suggested_rarity as Rarity,
      creatorId: row.creator_id,
      creatorDisplayName: row.creator_display_name,
      creatorEmoji: row.creator_emoji as CreatorEmoji,
      creatorAccentColor: row.creator_accent_color as AccentColor,
      upvotes: row.upvotes,
      status: row.status as 'pending' | 'graduated',
      createdAt: row.created_at,
      graduatedAt: row.graduated_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
