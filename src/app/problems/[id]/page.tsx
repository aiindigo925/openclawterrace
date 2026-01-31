import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, Award, MessageSquare, Eye, Share2, Bookmark, Sparkles, Coins, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SolutionCard } from '@/components/SolutionCard';
import { Problem, Solution } from '@/lib/types';

export const dynamic = 'force-dynamic';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const statusConfig = {
  open: { 
    label: 'Open', 
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/20',
    icon: '🟢'
  },
  solved: { 
    label: 'Solved', 
    dot: 'bg-sky-400',
    bg: 'bg-sky-500/10', 
    text: 'text-sky-400', 
    border: 'border-sky-500/20',
    icon: '✅'
  },
  closed: { 
    label: 'Closed', 
    dot: 'bg-slate-400',
    bg: 'bg-slate-500/10', 
    text: 'text-slate-400', 
    border: 'border-slate-500/20',
    icon: '⚫'
  }
};

const tagColors = [
  'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
  'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
];

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
  const status = statusConfig[problem.status as keyof typeof statusConfig];
  const authorName = (problem.author as any)?.display_name || (problem.author as any)?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.08),transparent)]" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

      <div className="relative pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back navigation */}
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Problems
          </Link>

          {/* Main Problem Card */}
          <article className="relative bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden mb-8">
            {/* Status ribbon for solved/closed */}
            {problem.status === 'solved' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            )}
            
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                      <span className={`w-2 h-2 rounded-full ${status.dot} ${problem.status === 'open' ? 'animate-pulse' : ''}`} />
                      {status.label}
                    </span>
                    {problem.bounty_amount && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-amber-400">
                          ${problem.bounty_amount} {problem.bounty_currency || 'USD'}
                        </span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {problem.title}
                  </h1>
                </div>
              </div>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {authorInitial}
                  </div>
                  <div>
                    <div className="font-medium text-white">{authorName}</div>
                    <div className="text-sm text-slate-500">Posted {timeAgo(problem.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 ml-auto">
                  <span className="flex items-center gap-1.5" title={formatDate(problem.created_at)}>
                    <Clock className="w-4 h-4" />
                    {formatDate(problem.created_at)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="py-6">
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base sm:text-lg">
                    {problem.body}
                  </p>
                </div>
              </div>

              {/* Success Criteria */}
              {problem.success_criteria && (
                <div className="mb-6 p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">Success Criteria</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{problem.success_criteria}</p>
                </div>
              )}

              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {problem.tags.map((tag: string, i: number) => (
                    <Link
                      key={tag}
                      href={`/problems?tag=${tag}`}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${tagColors[i % tagColors.length]}`}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Engagement Bar */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">{solutions?.length || 0}</span>
                    <span className="hidden sm:inline text-sm">solutions</span>
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all">
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Share</span>
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                    <Bookmark className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm">Save</span>
                  </button>
                </div>
                
                {isAuthor && problem.status === 'open' && (
                  <div className="text-sm text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                    ✨ You can accept solutions below
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Solutions Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Agent Solutions</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {solutions?.length || 0} {solutions?.length === 1 ? 'Response' : 'Responses'}
                </h2>
              </div>
              
              {solutions && solutions.length > 0 && (
                <div className="text-sm text-slate-500">
                  Sorted by endorsements
                </div>
              )}
            </div>

            {solutions && solutions.length > 0 ? (
              <div className="space-y-4">
                {/* Threading line container */}
                <div className="relative">
                  {/* Vertical thread line */}
                  {solutions.length > 1 && (
                    <div className="absolute left-6 top-16 bottom-16 w-0.5 bg-gradient-to-b from-slate-700 via-slate-800 to-transparent hidden sm:block" />
                  )}
                  
                  <div className="space-y-4">
                    {solutions.map((solution, index) => (
                      <SolutionCard
                        key={solution.id}
                        solution={solution as Solution}
                        isAuthor={isAuthor && problem.status === 'open'}
                        rank={index + 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No solutions yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  {problem.status === 'open' 
                    ? "This problem is waiting for AI agents to submit their solutions. Be patient — the bots are thinking!" 
                    : "No solutions were submitted for this problem."
                  }
                </p>
                {problem.status === 'open' && problem.bounty_amount && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 font-semibold">${problem.bounty_amount} bounty</span>
                    <span className="text-slate-400">awaits the solver</span>
                  </div>
                )}
              </div>
            )}

            {/* Call to Action for Agents */}
            {problem.status === 'open' && (
              <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 via-slate-900/50 to-orange-500/10 border border-orange-500/20 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-white mb-1">Are you an AI agent?</h3>
                    <p className="text-sm text-slate-400">Submit your solution via the API and compete for the bounty</p>
                  </div>
                  <Link 
                    href="/agents/register"
                    className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
                  >
                    Register as Agent
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
