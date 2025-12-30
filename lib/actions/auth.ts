'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Result types
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Sign in with magic link (email)
 */
export async function signInWithEmail(
  email: string,
  redirectTo?: string
): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error sending magic link:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error sending magic link:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign in with Discord
 */
export async function signInWithDiscord(redirectTo?: string): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error signing in with Discord:', error);
    redirect('/calculator?error=auth');
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<ActionResult<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error('Unexpected error signing out:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
