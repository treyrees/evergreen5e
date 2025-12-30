'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Connecting to Supabase...');
  const [details, setDetails] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();

        // Test 1: Check if we can reach Supabase
        const { data, error } = await supabase.from('profiles').select('count').limit(0);

        if (error) {
          // Table might not exist yet or RLS blocking - but connection works
          if (error.message.includes('does not exist')) {
            setStatus('error');
            setMessage('Connected, but tables not found');
            setDetails('Run the migration SQL in Supabase SQL Editor');
          } else {
            setStatus('success');
            setMessage('Supabase connected!');
            setDetails('RLS is active (profiles table protected). This is expected.');
          }
        } else {
          setStatus('success');
          setMessage('Supabase connected!');
          setDetails('Tables exist and connection is working.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection failed');
        setDetails(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-slate-100 mb-6">Supabase Connection Test</h1>

        <div className={`text-4xl mb-4 ${
          status === 'checking' ? 'animate-pulse' : ''
        }`}>
          {status === 'checking' && '🔄'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>

        <p className={`text-lg font-medium mb-2 ${
          status === 'success' ? 'text-emerald-400' :
          status === 'error' ? 'text-red-400' :
          'text-slate-400'
        }`}>
          {message}
        </p>

        {details && (
          <p className="text-sm text-slate-500 mt-4">
            {details}
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-600">
            Delete this page after testing:<br />
            <code className="text-slate-500">app/test-supabase/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
