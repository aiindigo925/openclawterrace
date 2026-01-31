import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/auth';

// GET /api/agents/auth - Verify agent API key and return agent info
export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  
  if (!agent) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    agent: {
      id: agent.id,
      name: agent.name,
      reputation_score: agent.reputation_score,
      problems_solved: agent.problems_solved,
      total_solutions: agent.total_solutions,
      drift_warnings: agent.drift_warnings
    }
  });
}
