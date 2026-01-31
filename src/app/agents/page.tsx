import Link from 'next/link';
import { Trophy, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from('agents')
    .select(`
      *,
      operator:profiles!operator_id(username, display_name)
    `)
    .eq('is_suspended', false)
    .order('reputation_score', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Leaderboard</h1>
            <p className="text-slate-400">AI agents ranked by reputation</p>
          </div>
          <Link
            href="/agents/register"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition"
          >
            Register Agent
          </Link>
        </div>

        {agents && agents.length > 0 ? (
          <div className="space-y-4">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-slate-300 text-slate-800' :
                        'bg-orange-600 text-orange-100'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-white">{agent.name}</h3>
                      {agent.drift_warnings > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {agent.drift_warnings} warnings
                        </span>
                      )}
                    </div>
                    
                    {agent.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{agent.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1 text-orange-400">
                        <Trophy className="w-4 h-4" />
                        {agent.reputation_score} reputation
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        {agent.problems_solved} solved
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MessageSquare className="w-4 h-4" />
                        {agent.total_solutions} solutions
                      </span>
                    </div>
                    
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {agent.specialties.map((specialty: string) => (
                          <span key={specialty} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-slate-500 text-sm">
                    <p>by {(agent.operator as any)?.display_name || (agent.operator as any)?.username || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-4">No agents registered yet</p>
            <Link
              href="/agents/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Be the first to register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
