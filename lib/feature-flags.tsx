'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// ============================================
// Feature Flags for Community Features
// ============================================

export interface FeatureFlags {
  // Community features
  communitySubmissions: boolean; // Can user submit items to community?
  communityVoting: boolean; // Can user vote on submissions?
  includeCommunityItems: boolean; // Show community items in "What's Similar?"

  // User state
  isAuthenticated: boolean;
  tickets: number;
  totalVotes: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  communitySubmissions: false,
  communityVoting: true, // Anyone can vote (to bootstrap)
  includeCommunityItems: false, // User preference, stored in localStorage
  isAuthenticated: false,
  tickets: 0,
  totalVotes: 0,
};

// Context for feature flags
const FeatureFlagsContext = createContext<{
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean | number) => void;
  canSubmit: () => boolean;
  earnTicketFromVotes: () => boolean;
} | null>(null);

// Provider component
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('evergreen5e-flags');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFlags(prev => ({
          ...prev,
          includeCommunityItems: parsed.includeCommunityItems ?? false,
        }));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Persist preferences to localStorage
  const setFlag = (key: keyof FeatureFlags, value: boolean | number) => {
    setFlags(prev => {
      const next = { ...prev, [key]: value };

      // Persist user preferences
      if (key === 'includeCommunityItems') {
        localStorage.setItem('evergreen5e-flags', JSON.stringify({
          includeCommunityItems: next.includeCommunityItems,
        }));
      }

      return next;
    });
  };

  // Check if user can submit (has tickets or is premium)
  const canSubmit = () => {
    return flags.tickets > 0 || flags.communitySubmissions;
  };

  // Check if user earned a ticket from voting (every 15 votes)
  // Returns true if a new ticket was earned
  const earnTicketFromVotes = () => {
    const newTotal = flags.totalVotes + 1;
    const ticketsEarned = Math.floor(newTotal / 15);
    const previousTicketsEarned = Math.floor(flags.totalVotes / 15);

    if (ticketsEarned > previousTicketsEarned) {
      setFlags(prev => ({
        ...prev,
        totalVotes: newTotal,
        tickets: prev.tickets + 1,
      }));
      return true;
    }

    setFlags(prev => ({ ...prev, totalVotes: newTotal }));
    return false;
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag, canSubmit, earnTicketFromVotes }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);

  if (!context) {
    // Return a standalone version for components outside the provider
    // This allows gradual adoption
    return {
      flags: DEFAULT_FLAGS,
      setFlag: () => {},
      canSubmit: () => false,
      earnTicketFromVotes: () => false,
    };
  }

  return context;
}

// Standalone hook for community items preference (doesn't require provider)
export function useCommunityItemsPreference() {
  const [includeCommunityItems, setIncludeCommunityItems] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('evergreen5e-flags');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIncludeCommunityItems(parsed.includeCommunityItems ?? false);
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  const toggle = () => {
    const newValue = !includeCommunityItems;
    setIncludeCommunityItems(newValue);
    localStorage.setItem('evergreen5e-flags', JSON.stringify({
      includeCommunityItems: newValue,
    }));
  };

  return { includeCommunityItems, toggle };
}
