'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CombatFeatures, Rarity } from '@/types/magic-item';

// Types for saved item operations
export interface SaveItemInput {
  name: string;
  baseItem: string;
  attunement: boolean;
  combat: CombatFeatures;
  flavorText?: string | null;
  score: number;
  suggestedRarity: Rarity;
}

export interface SavedItem {
  id: string;
  name: string;
  baseItem: string;
  attunement: boolean;
  combat: CombatFeatures;
  flavorText: string | null;
  score: number;
  suggestedRarity: Rarity;
  createdAt: string;
  updatedAt: string;
}

// Result types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Save an item to the user's private collection
 */
export async function saveItem(input: SaveItemInput): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input data before saving
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: 'Item name is required' };
    }
    if (input.name.length > 100) {
      return { success: false, error: 'Item name must be 100 characters or less' };
    }
    if (!input.baseItem) {
      return { success: false, error: 'Base item is required' };
    }
    // Check for invalid score values
    if (typeof input.score !== 'number' || !isFinite(input.score)) {
      return { success: false, error: 'Invalid score value' };
    }
    // Check rarity is valid
    const validRarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Legendary*'];
    if (!validRarities.includes(input.suggestedRarity)) {
      return { success: false, error: 'Invalid rarity value' };
    }

    // Insert the item
    // Note: Using cosmetic_features for backwards compatibility until migration runs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('saved_items')
      .insert({
        user_id: user.id,
        name: input.name.trim(),
        base_item: input.baseItem,
        attunement: input.attunement,
        combat: input.combat,
        cosmetic_features: input.flavorText || null, // Store in existing column
        score: input.score,
        suggested_rarity: input.suggestedRarity,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving item:', error);
      // Return specific error message for common issues
      if (error.code === '23505') {
        return { success: false, error: 'An item with this name already exists' };
      }
      if (error.code === '23514') {
        return { success: false, error: 'Invalid item data: constraint violation' };
      }
      if (error.code === '42501') {
        return { success: false, error: 'Permission denied. Please sign in again.' };
      }
      // Handle missing table error (Supabase schema cache error)
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return { success: false, error: 'Save feature is temporarily unavailable. Please try again later.' };
      }
      // Include the actual error message for debugging
      return { success: false, error: error.message || 'Failed to save item' };
    }

    revalidatePath('/calculator');
    return { success: true, data: { id: data.id } };
  } catch (err) {
    console.error('Unexpected error saving item:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Get all saved items for the current user
 */
export async function getSavedItems(): Promise<ActionResult<SavedItem[]>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved items:', error);
      // Handle missing table error (Supabase schema cache error)
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return { success: false, error: 'Save feature is temporarily unavailable. Please try again later.' };
      }
      return { success: false, error: 'Failed to fetch items' };
    }

    // Transform to camelCase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: SavedItem[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      baseItem: row.base_item,
      attunement: row.attunement,
      combat: row.combat as unknown as CombatFeatures,
      // Support both old format (special_mechanics + cosmetic_features) and new (flavor_text)
      flavorText: row.flavor_text || row.special_mechanics || row.cosmetic_features || null,
      score: row.score,
      suggestedRarity: row.suggested_rarity as Rarity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    console.error('Unexpected error fetching items:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update a saved item
 */
export async function updateSavedItem(
  id: string,
  input: Partial<SaveItemInput>
): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input if provided
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'Item name is required' };
      }
      if (input.name.length > 100) {
        return { success: false, error: 'Item name must be 100 characters or less' };
      }
    }
    if (input.score !== undefined && (typeof input.score !== 'number' || !isFinite(input.score))) {
      return { success: false, error: 'Invalid score value' };
    }
    if (input.suggestedRarity !== undefined) {
      const validRarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Legendary*'];
      if (!validRarities.includes(input.suggestedRarity)) {
        return { success: false, error: 'Invalid rarity value' };
      }
    }

    // Build update object (only include provided fields)
    // Note: Using cosmetic_features for backwards compatibility until migration runs
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.baseItem !== undefined) updateData.base_item = input.baseItem;
    if (input.attunement !== undefined) updateData.attunement = input.attunement;
    if (input.combat !== undefined) updateData.combat = input.combat;
    if (input.flavorText !== undefined) updateData.cosmetic_features = input.flavorText;
    if (input.score !== undefined) updateData.score = input.score;
    if (input.suggestedRarity !== undefined) updateData.suggested_rarity = input.suggestedRarity;

    // Update the item (RLS ensures user can only update their own)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('saved_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating item:', error);
      // Return specific error message for common issues
      if (error.code === '23505') {
        return { success: false, error: 'An item with this name already exists' };
      }
      if (error.code === '23514') {
        return { success: false, error: 'Invalid item data: constraint violation' };
      }
      if (error.code === '42501') {
        return { success: false, error: 'Permission denied. Please sign in again.' };
      }
      // Handle missing table error (Supabase schema cache error)
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return { success: false, error: 'Save feature is temporarily unavailable. Please try again later.' };
      }
      return { success: false, error: error.message || 'Failed to update item' };
    }

    revalidatePath('/calculator');
    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error updating item:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Delete a saved item
 */
export async function deleteSavedItem(id: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Delete the item (RLS ensures user can only delete their own)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('saved_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting item:', error);
      // Handle missing table error (Supabase schema cache error)
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return { success: false, error: 'Save feature is temporarily unavailable. Please try again later.' };
      }
      return { success: false, error: 'Failed to delete item' };
    }

    revalidatePath('/calculator');
    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error deleting item:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get current user info (for auth state)
 */
export async function getCurrentUser(): Promise<ActionResult<{ id: string; email: string | undefined } | null>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: user ? { id: user.id, email: user.email } : null,
    };
  } catch (err) {
    console.error('Unexpected error getting user:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
