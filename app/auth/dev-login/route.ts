import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const TEST_USER_EMAIL = 'dev-tester@evergreen5e.local';
const TEST_USER_PASSWORD = 'dev-tester-password-12345';

/**
 * Dev-only login route for testing in preview deployments.
 *
 * Usage: /auth/dev-login?token=YOUR_DEV_TOKEN&next=/vote
 *
 * Required env vars:
 * - DEV_AUTH_TOKEN: Secret token to authorize dev login
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key for admin API
 *
 * This creates/signs in a test user and redirects to the target page.
 * Only works when DEV_AUTH_TOKEN is set (should NOT be set in production).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');
  const next = searchParams.get('next') ?? '/calculator';

  // Check if dev auth is enabled
  const devToken = process.env.DEV_AUTH_TOKEN;

  if (!devToken) {
    return NextResponse.json(
      { error: 'Dev auth not enabled. Set DEV_AUTH_TOKEN in environment.' },
      { status: 403 }
    );
  }

  // Validate token
  if (token !== devToken) {
    return NextResponse.json(
      { error: 'Invalid dev token' },
      { status: 401 }
    );
  }

  try {
    const adminClient = createAdminClient();

    // Check if test user exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    let testUser = existingUsers?.users?.find(u => u.email === TEST_USER_EMAIL);

    if (!testUser) {
      // Create test user
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          display_name: 'Dev Tester',
          emoji: '🧪',
          accent_color: 'emerald',
        },
      });

      if (createError) {
        console.error('Error creating test user:', createError);
        return NextResponse.json(
          { error: `Failed to create test user: ${createError.message}` },
          { status: 500 }
        );
      }

      testUser = newUser.user;
    }

    // Generate a magic link for the test user (this creates a valid session)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: TEST_USER_EMAIL,
      options: {
        redirectTo: `${origin}${next}`,
      },
    });

    if (linkError || !linkData) {
      console.error('Error generating link:', linkError);
      return NextResponse.json(
        { error: `Failed to generate session: ${linkError?.message}` },
        { status: 500 }
      );
    }

    // Extract the token from the magic link and exchange it for a session
    const magicLinkUrl = new URL(linkData.properties.action_link);
    const tokenHash = magicLinkUrl.searchParams.get('token');
    const type = magicLinkUrl.searchParams.get('type');

    if (!tokenHash || !type) {
      return NextResponse.json(
        { error: 'Failed to extract token from magic link' },
        { status: 500 }
      );
    }

    // Create a server client to set cookies
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Verify the OTP token to create a session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'magiclink',
    });

    if (verifyError) {
      console.error('Error verifying OTP:', verifyError);
      return NextResponse.json(
        { error: `Failed to create session: ${verifyError.message}` },
        { status: 500 }
      );
    }

    // Redirect to the target page
    return NextResponse.redirect(`${origin}${next}`);

  } catch (err) {
    console.error('Dev login error:', err);
    return NextResponse.json(
      { error: 'Dev login failed' },
      { status: 500 }
    );
  }
}
