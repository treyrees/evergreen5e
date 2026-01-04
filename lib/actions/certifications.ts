'use server';

import { createClient } from '@/lib/supabase/server';
import type { Rarity, Certification } from '@/types/magic-item';

// Input for creating a certification (includes item stats for display)
export interface CreateCertificationInput {
  itemName: string;
  creatorName?: string | null;
  baseItem: string;
  attunement: boolean;
  score: number;
  suggestedRarity: Rarity;

  // Item stats (for display on certificate)
  enhancementBonus?: number;
  acBonus?: number;
  savingThrowBonus?: number;
  extraDamageDice?: string;
  extraDamageType?: string;
  chargesDescription?: string;

  // Flavor text (cosmetic description)
  flavorText?: string | null;
}

// Result types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Create a new certification
 * Can be created anonymously (no user) or linked to a user account
 */
export async function createCertification(
  input: CreateCertificationInput,
  linkToUser: boolean = false
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();

    // Get user if linking to account
    let userId: string | null = null;
    if (linkToUser) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }

    // Insert the certification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('certifications')
      .insert({
        user_id: userId,
        item_name: input.itemName,
        creator_name: input.creatorName || null,
        base_item: input.baseItem,
        attunement: input.attunement,
        score: input.score,
        suggested_rarity: input.suggestedRarity,
        // Item stats
        enhancement_bonus: input.enhancementBonus || null,
        ac_bonus: input.acBonus || null,
        saving_throw_bonus: input.savingThrowBonus || null,
        extra_damage_dice: input.extraDamageDice || null,
        extra_damage_type: input.extraDamageType || null,
        charges_description: input.chargesDescription || null,
        // Flavor text
        flavor_text: input.flavorText || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating certification:', error);
      // Return more specific error message for debugging
      if (error.code === '42P01') {
        return { success: false, error: 'Database table not found. Please run migrations.' };
      }
      if (error.code === '42501') {
        return { success: false, error: 'Permission denied. Check RLS policies.' };
      }
      return { success: false, error: error.message || 'Failed to create certification' };
    }

    return { success: true, data: { id: data.id } };
  } catch (err) {
    console.error('Unexpected error creating certification:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a certification by ID (public)
 */
export async function getCertification(id: string): Promise<ActionResult<Certification | null>> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('certifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { success: true, data: null };
      }
      console.error('Error fetching certification:', error);
      return { success: false, error: 'Failed to fetch certification' };
    }

    const certification: Certification = {
      id: data.id,
      userId: data.user_id,
      itemName: data.item_name,
      creatorName: data.creator_name,
      baseItem: data.base_item,
      attunement: data.attunement,
      score: parseFloat(data.score),
      suggestedRarity: data.suggested_rarity as Rarity,
      createdAt: data.created_at,
      // Item stats
      enhancementBonus: data.enhancement_bonus ?? undefined,
      acBonus: data.ac_bonus ?? undefined,
      savingThrowBonus: data.saving_throw_bonus ?? undefined,
      extraDamageDice: data.extra_damage_dice ?? undefined,
      extraDamageType: data.extra_damage_type ?? undefined,
      chargesDescription: data.charges_description ?? undefined,
      // Flavor text
      flavorText: data.flavor_text ?? undefined,
    };

    return { success: true, data: certification };
  } catch (err) {
    console.error('Unexpected error fetching certification:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all certifications for the current user
 */
export async function getUserCertifications(): Promise<ActionResult<Certification[]>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('certifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching certifications:', error);
      return { success: false, error: 'Failed to fetch certifications' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certifications: Certification[] = data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      itemName: row.item_name,
      creatorName: row.creator_name,
      baseItem: row.base_item,
      attunement: row.attunement,
      score: parseFloat(row.score),
      suggestedRarity: row.suggested_rarity as Rarity,
      createdAt: row.created_at,
      // Item stats
      enhancementBonus: row.enhancement_bonus ?? undefined,
      acBonus: row.ac_bonus ?? undefined,
      savingThrowBonus: row.saving_throw_bonus ?? undefined,
      extraDamageDice: row.extra_damage_dice ?? undefined,
      extraDamageType: row.extra_damage_type ?? undefined,
      chargesDescription: row.charges_description ?? undefined,
      // Flavor text
      flavorText: row.flavor_text ?? undefined,
    }));

    return { success: true, data: certifications };
  } catch (err) {
    console.error('Unexpected error fetching certifications:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a certification (only owner can delete)
 */
export async function deleteCertification(id: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('certifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting certification:', error);
      return { success: false, error: 'Failed to delete certification' };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error deleting certification:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
