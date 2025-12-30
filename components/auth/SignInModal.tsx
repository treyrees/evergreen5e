'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function SignInModal({ isOpen, onClose, redirectTo }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${redirectTo}` : ''}`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${redirectTo}` : ''}`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If successful, user is redirected to Discord
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-sm mx-4 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-slate-100 mb-2">Sign In</h2>
        <p className="text-sm text-slate-400 mb-6">
          Save your items and access them anywhere
        </p>

        {emailSent ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✉️</div>
            <p className="text-slate-200 font-medium mb-2">Check your email</p>
            <p className="text-sm text-slate-400">
              We sent a magic link to <span className="text-slate-300">{email}</span>
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Discord button */}
            <button
              onClick={handleDiscordSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-md transition-colors mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800 px-2 text-slate-500">or</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignIn}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 bg-slate-900/50 border border-slate-700 rounded-md focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 mb-3"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>

            {error && (
              <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
