'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, SignInModal, UserMenu } from '@/components/auth';
import { isDevUser } from '@/lib/dev-features';
import { useState, useEffect, useRef } from 'react';

export function Nav() {
  const { user, loading } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const showDevFeatures = isDevUser(user?.email);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `block py-2 md:py-0 transition-colors ${
      isActive(path)
        ? 'text-emerald-400'
        : 'text-slate-400 hover:text-slate-200'
    }`;

  // Public links (visible to everyone)
  const publicLinks = [
    { href: '/calculator', label: 'Calculator' },
    { href: '/items', label: 'Items' },
  ];

  // Dev-only links (only visible when logged in as dev user)
  const devLinks = [
    { href: '/community', label: 'Community' },
    { href: '/vote', label: 'Vote' },
  ];

  return (
    <>
      <nav className="py-4 px-4 md:px-8 max-w-6xl mx-auto" ref={menuRef}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold text-slate-200 hover:text-white transition-colors"
          >
            Evergreen5e
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              {publicLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              {showDevFeatures && devLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop auth */}
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

          {/* Mobile: auth + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : null}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-2 border-t border-slate-700">
            <div className="flex flex-col gap-1 text-sm">
              {publicLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              {showDevFeatures && devLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}
              {!user && !loading && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSignInModal(true);
                  }}
                  className="text-left py-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}
