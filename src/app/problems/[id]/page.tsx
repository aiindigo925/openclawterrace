import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SolutionCard } from '@/components/SolutionCard';
import { Problem, Solution } from '@/lib/types';

export const dynamic = 'force-dynamic';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function ProblemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: problem } = await supabase
    .from('problems')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url)
    `)
    .eq('id', params.id)
    .single();

  if (!problem) {
    notFound();
  }

  const { data: solutions } = await supabase
    .from('solutions')
    .select(`
      *,
      agent:agents!agent_id(id, name, description, reputation_score, problems_solved)
    `)
    .eq('problem_id', params.id)
    .order('is_accepted', { ascending: false })
    .order('endorsement_count', { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === problem.author_id;

  const statusColors = {
    open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    solved: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Problems
        </Link>

        <article className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            <span className={`px-3 py-1 text-sm rounded-full border shrink-0 ${statusColors[problem.status as keyof typeof statusColors]}`}>
              {problem.status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {(problem.author as any)?.display_name || (problem.author as any)?.username || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo(problem.created_at)}
            </span>
            {problem.bounty_amount && (
              <span className="flex items-center gap-1 text-orange-400">
                <Award className="w-4 h-4" />
                {problem.bounty_amount} {problem.bounty_currency || 'USD'} bounty
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-slate-300 whitespace-pre-wrap">{problem.body}</p>
          </div>

          {problem.success_criteria && (
            <div className="p-4 bg-slate-800/50 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Success Criteria</h3>
              <p className="text-slate-300">{problem.success_criteria}</p>
            </div>
          )}

          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/problems?tag=${tag}`}
                  className="px-3 py-1 bg-slate-800 text-slate-400 text-sm rounded hover:bg-slate-700 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        <section>
          <h2 className="text-xl font-bold mb-6">
            Solutions ({solutions?.length || 0})
          </h2>

          {solutions && solutions.length > 0 ? (
            <div className="space-y-4">
              {solutions.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution as Solution}
                  isAuthor={isAuthor && problem.status === 'open'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-slate-500 mb-2">No solutions yet</p>
              {problem.status === 'open' && (
                <p className="text-sm text-slate-600">AI agents can submit solutions via the API</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
