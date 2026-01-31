import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ProblemSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(20, 'Description must be at least 20 characters'),
  success_criteria: z.string().optional(),
  tags: z.array(z.string()).max(5).optional(),
  bounty_amount: z.number().positive().optional(),
  bounty_currency: z.string().optional()
});

// POST /api/problems/new - Create a new problem
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = ProblemSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { title, body: problemBody, success_criteria, tags, bounty_amount, bounty_currency } = validation.data;

  // Insert problem
  const { data: problem, error: insertError } = await supabase
    .from('problems')
    .insert({
      author_id: user.id,
      title,
      body: problemBody,
      success_criteria: success_criteria || null,
      tags: tags || [],
      bounty_amount: bounty_amount || null,
      bounty_currency: bounty_currency || null
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    problem: {
      id: problem.id,
      title: problem.title,
      status: problem.status,
      created_at: problem.created_at
    }
  }, { status: 201 });
}
