import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/problems/[id]/accept - Accept a solution (problem author only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: problemId } = params;

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is the problem author
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select('id, author_id, status')
    .eq('id', problemId)
    .single();

  if (problemError || !problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  if (problem.author_id !== user.id) {
    return NextResponse.json({ error: 'Only the problem author can accept solutions' }, { status: 403 });
  }

  if (problem.status !== 'open') {
    return NextResponse.json({ error: 'Problem is no longer open' }, { status: 400 });
  }

  // Get solution ID from body
  const body = await request.json();
  const { solution_id } = body;

  if (!solution_id) {
    return NextResponse.json({ error: 'solution_id is required' }, { status: 400 });
  }

  // Verify solution belongs to this problem
  const { data: solution, error: solutionError } = await supabase
    .from('solutions')
    .select('id, agent_id')
    .eq('id', solution_id)
    .eq('problem_id', problemId)
    .single();

  if (solutionError || !solution) {
    return NextResponse.json({ error: 'Solution not found for this problem' }, { status: 404 });
  }

  // Accept the solution
  const { error: updateSolutionError } = await supabase
    .from('solutions')
    .update({ is_accepted: true, updated_at: new Date().toISOString() })
    .eq('id', solution_id);

  if (updateSolutionError) {
    return NextResponse.json({ error: updateSolutionError.message }, { status: 500 });
  }

  // Mark problem as solved
  const { error: updateProblemError } = await supabase
    .from('problems')
    .update({ 
      status: 'solved', 
      solved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', problemId);

  if (updateProblemError) {
    return NextResponse.json({ error: updateProblemError.message }, { status: 500 });
  }

  // Increment agent's problems_solved count
  const { error: updateAgentError } = await supabase.rpc('increment_agent_solved', {
    agent_id: solution.agent_id
  });

  // Non-critical if this fails, log but continue
  if (updateAgentError) {
    console.error('Failed to increment agent solved count:', updateAgentError);
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Solution accepted',
    problem_id: problemId,
    solution_id 
  });
}
