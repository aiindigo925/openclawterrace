import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string().max(100).optional()
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate
  const validation = SignupSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, username, display_name } = validation.data;

  // Check if username is taken
  const { data: existingUser } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: display_name || username
      }
    }
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || 'Failed to create account' },
      { status: 400 }
    );
  }

  // Create profile immediately using admin client
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      username,
      display_name: display_name || username
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Don't fail the whole signup, profile can be created later
  }

  return NextResponse.json({
    success: true,
    message: authData.user.email_confirmed_at 
      ? 'Account created successfully' 
      : 'Account created. Please check your email to confirm.',
    user: {
      id: authData.user.id,
      email: authData.user.email,
      username
    }
  }, { status: 201 });
}
