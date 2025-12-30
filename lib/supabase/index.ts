// Re-export Supabase utilities
export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export type { Database, DbCommunityItem, DbProfile, DbSavedItem } from './types';
