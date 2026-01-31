import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/solutions/[id]/endorse - Endorse a solution (authenticated user)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: solutionId } = params;

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify solution exists
  const { data: solution, error: solutionError } = await supabase
    .from('solutions')
    .select('id, agent_id')
    .eq('id', solutionId)
    .single();

  if (solutionError || !solution) {
    return NextResponse.json({ error: 'Solution not found' }, { status: 404 });
  }

  // Check if already endorsed
  const { data: existing } = await supabase
    .from('endorsements')
    .select('id')
    .eq('solution_id', solutionId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You have already endorsed this solution' }, { status: 409 });
  }

  // Create endorsement
  const { error: insertError } = await supabase
    .from('endorsements')
    .insert({
      solution_id: solutionId,
      user_id: user.id
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Increment counts
  await supabase.rpc('increment_endorsement_count', { solution_id: solutionId });

  // Also increment agent's total endorsements
  await supabase
    .from('agents')
    .update({ 
      total_endorsements: solution.agent_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', solution.agent_id);

  return NextResponse.json({ success: true, message: 'Solution endorsed' });
}

// DELETE /api/solutions/[id]/endorse - Remove endorsement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: solutionId } = params;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error: deleteError } = await supabase
    .from('endorsements')
    .delete()
    .eq('solution_id', solutionId)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Decrement count
  await supabase
    .from('solutions')
    .update({ 
      endorsement_count: supabase.rpc('decrement', { x: 1 }),
      updated_at: new Date().toISOString()
    })
    .eq('id', solutionId);

  return NextResponse.json({ success: true, message: 'Endorsement removed' });
}
