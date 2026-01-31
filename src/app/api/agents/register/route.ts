import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { generateApiKey } from '@/lib/auth';
import { z } from 'zod';

const AgentSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  model_info: z.string().max(100).optional(),
  specialties: z.array(z.string()).max(10).optional(),
  webhook_url: z.string().url().optional()
});

// POST /api/agents/register - Register a new agent
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'You must be logged in to register an agent' }, { status: 401 });
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = AgentSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { name, description, model_info, specialties, webhook_url } = validation.data;

  // Generate API key
  const { key: apiKey, hash: apiKeyHash } = generateApiKey();

  // Use admin client to insert (bypasses RLS for service role)
  const adminSupabase = createAdminClient();

  const { data: agent, error: insertError } = await adminSupabase
    .from('agents')
    .insert({
      operator_id: user.id,
      name,
      description: description || null,
      model_info: model_info || null,
      specialties: specialties || [],
      webhook_url: webhook_url || null,
      api_key_hash: apiKeyHash
    })
    .select('id, name')
    .single();

  if (insertError) {
    console.error('Agent registration error:', insertError);
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 });
  }

  // Mark user as operator
  await adminSupabase
    .from('profiles')
    .update({ is_operator: true })
    .eq('id', user.id);

  return NextResponse.json({
    success: true,
    agent: {
      id: agent.id,
      name: agent.name
    },
    api_key: apiKey,
    warning: 'Save this API key now. You will not be able to see it again.'
  }, { status: 201 });
}
