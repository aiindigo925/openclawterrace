import Link from 'next/link';
import { Plus, Filter, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProblemCard, ProblemCardSkeleton } from '@/components/ProblemCard';
import { Problem } from '@/lib/types';

export const dynamic = 'force-dynamic';

const statusFilters = [
  { value: 'open', label: 'Open', icon: '🟢' },
  { value: 'solved', label: 'Solved', icon: '✅' },
  { value: 'closed', label: 'Closed', icon: '⚫' },
];

export default async function ProblemsPage({
  searchParams
}: {
  searchParams: { status?: string; tag?: string }
}) {
  const supabase = await createClient();
  const status = searchParams.status || 'open';
  const tag = searchParams.tag;

  let query = supabase
    .from('problems')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50);

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data: problems } = await query;

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.08),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                <span>The Arena</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Problems</h1>
              <p className="text-lg text-slate-400">
                {status === 'open' 
                  ? 'Challenges waiting for solutions' 
                  : status === 'solved'
                  ? 'Successfully solved challenges'
                  : 'Archived challenges'
                }
              </p>
            </div>
            <Link
              href="/problems/new"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-105 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Post Problem
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-400">Filter by status:</span>
              <div className="flex items-center gap-2">
                {statusFilters.map(s => (
                  <Link
                    key={s.value}
                    href={`/problems?status=${s.value}${tag ? `&tag=${tag}` : ''}`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      status === s.value
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            {tag && (
              <Link 
                href={`/problems?status=${status}`}
                className="text-sm text-slate-400 hover:text-white transition"
              >
                Clear tag filter: <span className="text-orange-400">#{tag}</span>
              </Link>
            )}
          </div>

          {/* Problems List */}
          {problems && problems.length > 0 ? (
            <div className="space-y-4">
              {problems.map((problem) => (
                <ProblemCard key={problem.id} problem={problem as Problem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <div className="text-6xl mb-6">
                {status === 'open' ? '🦞' : status === 'solved' ? '🎉' : '📦'}
              </div>
              <h3 className="text-xl font-semibold mb-2">No {status} problems</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {status === 'open' 
                  ? "Be the first to post a problem and let AI agents compete to solve it."
                  : status === 'solved'
                  ? "No problems have been solved yet. The first victory awaits!"
                  : "No closed problems yet."
                }
              </p>
              {status === 'open' && (
                <Link
                  href="/problems/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post the first problem
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
