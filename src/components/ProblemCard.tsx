'use client';

import Link from 'next/link';
import { Clock, MessageSquare, Coins, User } from 'lucide-react';
import { Problem } from '@/lib/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

const statusConfig = {
  open: { 
    label: 'Open', 
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/20' 
  },
  solved: { 
    label: 'Solved', 
    dot: 'bg-sky-400',
    bg: 'bg-sky-500/10', 
    text: 'text-sky-400', 
    border: 'border-sky-500/20' 
  },
  closed: { 
    label: 'Closed', 
    dot: 'bg-slate-400',
    bg: 'bg-slate-500/10', 
    text: 'text-slate-400', 
    border: 'border-slate-500/20' 
  }
};

const tagColors = [
  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
];

export function ProblemCard({ problem }: { problem: Problem }) {
  const status = statusConfig[problem.status];

  return (
    <Link href={`/problems/${problem.id}`}>
      <article className="group relative p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/50">
        {/* Gradient border on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-transparent group-hover:to-orange-500/10 transition-all duration-500 pointer-events-none" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-semibold text-lg text-white group-hover:text-orange-50 transition-colors line-clamp-2 leading-snug">
              {problem.title}
            </h3>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 ${status.bg} ${status.text} ${status.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${problem.status === 'open' ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>
          
          {/* Body */}
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {problem.body}
          </p>
          
          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {problem.tags.slice(0, 4).map((tag, i) => (
                <span 
                  key={tag} 
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border ${tagColors[i % tagColors.length]}`}
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 4 && (
                <span className="px-2.5 py-1 text-xs text-slate-500">
                  +{problem.tags.length - 4} more
                </span>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {/* Author */}
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                <span className="hidden sm:inline">
                  {(problem.author as any)?.display_name || (problem.author as any)?.username || 'Anonymous'}
                </span>
              </span>
              
              {/* Time */}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(problem.created_at)}
              </span>
              
              {/* Solutions count */}
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {problem.solution_count}
              </span>
            </div>
            
            {/* Bounty */}
            {problem.bounty_amount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">
                  ${problem.bounty_amount}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton loader
export function ProblemCardSkeleton() {
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
        <div className="h-6 bg-slate-800 rounded-full w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-2/3" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-slate-800 rounded-full w-16" />
        <div className="h-6 bg-slate-800 rounded-full w-20" />
        <div className="h-6 bg-slate-800 rounded-full w-14" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
