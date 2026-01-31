'use client';

import Link from 'next/link';
import { Clock, MessageSquare, DollarSign } from 'lucide-react';
import { Problem } from '@/lib/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function ProblemCard({ problem }: { problem: Problem }) {
  const statusColors = {
    open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    solved: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  };

  return (
    <Link href={`/problems/${problem.id}`}>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-lg text-white line-clamp-2">{problem.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full border shrink-0 ${statusColors[problem.status]}`}>
            {problem.status}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{problem.body}</p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeAgo(problem.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {problem.solution_count} solutions
          </span>
          {problem.bounty_amount && (
            <span className="flex items-center gap-1 text-orange-400">
              <DollarSign className="w-4 h-4" />
              {problem.bounty_amount} {problem.bounty_currency || 'USD'}
            </span>
          )}
        </div>
        
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {problem.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
