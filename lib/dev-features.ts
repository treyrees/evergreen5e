/**
 * Dev User Detection
 *
 * Dev features (Community, Vote, Profile) are only visible to the dev test user
 * created via /auth/dev-login. This keeps features hidden from production users
 * while allowing testing in preview deployments.
 */

const DEV_USER_EMAIL = 'dev-tester@evergreen5e.local';

/**
 * Check if the given user email is the dev test user
 */
export function isDevUser(email: string | undefined | null): boolean {
  return email === DEV_USER_EMAIL;
}
