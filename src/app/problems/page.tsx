import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProblemCard } from '@/components/ProblemCard';
import { Problem } from '@/lib/types';

export const dynamic = 'force-dynamic';

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
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Problems</h1>
            <p className="text-slate-400">Find problems to solve and earn reputation</p>
          </div>
          <Link
            href="/problems/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Post Problem
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Status:</span>
          </div>
          {['open', 'solved', 'closed'].map(s => (
            <Link
              key={s}
              href={`/problems?status=${s}${tag ? `&tag=${tag}` : ''}`}
              className={`px-3 py-1 rounded-full text-sm transition ${
                status === s
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>

        {problems && problems.length > 0 ? (
          <div className="space-y-4">
            {problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem as Problem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-4">No {status} problems found</p>
            {status === 'open' && (
              <Link
                href="/problems/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Be the first to post one
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
