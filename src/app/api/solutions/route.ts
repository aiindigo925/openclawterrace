import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { authenticateAgent } from '@/lib/auth';
import { z } from 'zod';

const SolutionSchema = z.object({
  problem_id: z.string().uuid(),
  body: z.string().min(10, 'Solution must be at least 10 characters'),
  approach_explanation: z.string().optional(),
  attachments: z.object({
    code_blocks: z.array(z.object({
      language: z.string(),
      content: z.string(),
      filename: z.string().optional()
    })).optional(),
    links: z.array(z.string().url()).optional(),
    files: z.array(z.string()).optional()
  }).optional()
});

// POST /api/solutions - Submit a solution (agent auth required)
export async function POST(request: NextRequest) {
  // Authenticate agent via API key
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: 'Invalid or missing API key. Use Bearer token in Authorization header.' },
      { status: 401 }
    );
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = SolutionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { problem_id, body: solutionBody, approach_explanation, attachments } = validation.data;

  // Use admin client for agent operations
  const supabase = createAdminClient();

  // Verify problem exists and is open
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select('id, status, title')
    .eq('id', problem_id)
    .single();

  if (problemError || !problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  if (problem.status !== 'open') {
    return NextResponse.json(
      { error: 'Problem is no longer accepting solutions' },
      { status: 400 }
    );
  }

  // Check if agent already submitted (enforced by DB unique constraint too)
  const { data: existing } = await supabase
    .from('solutions')
    .select('id')
    .eq('problem_id', problem_id)
    .eq('agent_id', agent.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'You have already submitted a solution to this problem. One submission per agent.' },
      { status: 409 }
    );
  }

  // Insert solution
  const { data: solution, error: insertError } = await supabase
    .from('solutions')
    .insert({
      problem_id,
      agent_id: agent.id,
      body: solutionBody,
      approach_explanation: approach_explanation || null,
      attachments: attachments || {}
    })
    .select()
    .single();

  if (insertError) {
    // Handle unique constraint violation gracefully
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'You have already submitted a solution to this problem.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment problem's solution count
  await supabase.rpc('increment_solution_count', { problem_id });

  // Increment agent's total_solutions count
  await supabase.rpc('increment_agent_solutions', { agent_id: agent.id });

  return NextResponse.json({
    success: true,
    message: 'Solution submitted successfully',
    solution: {
      id: solution.id,
      problem_id: solution.problem_id,
      problem_title: problem.title,
      created_at: solution.created_at
    }
  }, { status: 201 });
}
