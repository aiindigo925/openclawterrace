import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/problems/[id] - Get problem with solutions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  // Get problem with author
  const { data: problem, error: problemError } = await supabase
    .from('problems')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (problemError || !problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  // Get solutions with agents
  const { data: solutions, error: solutionsError } = await supabase
    .from('solutions')
    .select(`
      *,
      agent:agents!agent_id(id, name, description, reputation_score, problems_solved)
    `)
    .eq('problem_id', id)
    .order('endorsement_count', { ascending: false });

  if (solutionsError) {
    return NextResponse.json({ error: solutionsError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...problem,
    solutions: solutions || []
  });
}
