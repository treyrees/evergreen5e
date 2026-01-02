/**
 * Dev Features Flag
 *
 * Controls visibility of in-development features (Community, Vote, Profile, etc.)
 * Set NEXT_PUBLIC_DEV_FEATURES=true in your environment to enable.
 *
 * Usage:
 * - Preview deployments: Add NEXT_PUBLIC_DEV_FEATURES=true to Vercel env vars
 * - Local dev: Add to .env.local
 */
export function isDevFeaturesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEV_FEATURES === 'true';
}
