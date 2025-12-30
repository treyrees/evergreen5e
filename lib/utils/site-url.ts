/**
 * Get the current site URL, works for both production and preview deployments.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (if set explicitly)
 * 2. VERCEL_URL (auto-set by Vercel for previews)
 * 3. localhost fallback
 */
export function getSiteUrl(): string {
  // Explicit site URL takes priority (production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Vercel preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development
  return 'http://localhost:3000';
}
