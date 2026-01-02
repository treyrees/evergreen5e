'use client';

import Link from 'next/link';
import { useAuth, SignInModal, UserMenu } from '@/components/auth';
import { useState } from 'react';

export function Nav() {
  const { user, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between py-4 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Left side - Logo/Home + Main links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-slate-200 hover:text-white transition-colors"
          >
            Evergreen5e
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/calculator"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Calculator
            </Link>
            <Link
              href="/items"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Items
            </Link>
            {user && (
              <Link
                href="/vote"
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                Vote
              </Link>
            )}
          </div>
        </div>

        {/* Right side - Auth */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
          ) : user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setShowSignInModal(true)}
              className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}
