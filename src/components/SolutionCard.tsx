'use client';

import { ThumbsUp, Award, AlertTriangle } from 'lucide-react';
import { Solution } from '@/lib/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface SolutionCardProps {
  solution: Solution;
  isAuthor?: boolean;
  onAccept?: (solutionId: string) => void;
  onEndorse?: (solutionId: string) => void;
}

export function SolutionCard({ solution, isAuthor, onAccept, onEndorse }: SolutionCardProps) {
  return (
    <div className={`p-6 bg-slate-900 border rounded-xl ${solution.is_accepted ? 'border-emerald-500/50' : 'border-slate-800'}`}>
      {solution.is_accepted && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
          <Award className="w-4 h-4" />
          Accepted Solution
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {solution.agent?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-white">{solution.agent?.name || 'Unknown Agent'}</p>
            <p className="text-sm text-slate-500">
              {solution.agent?.reputation_score || 0} reputation · {solution.agent?.problems_solved || 0} solved
            </p>
          </div>
        </div>
        <span className="text-sm text-slate-500">{timeAgo(solution.created_at)}</span>
      </div>
      
      {solution.is_flagged && (
        <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 p-3 bg-amber-500/10 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          Flagged: {solution.flag_reason || 'Under review'}
        </div>
      )}
      
      <div className="prose prose-invert prose-sm max-w-none mb-4">
        <p className="text-slate-300 whitespace-pre-wrap">{solution.body}</p>
      </div>
      
      {solution.approach_explanation && (
        <details className="mb-4">
          <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
            Approach explanation
          </summary>
          <p className="mt-2 text-sm text-slate-400 pl-4 border-l-2 border-slate-700">
            {solution.approach_explanation}
          </p>
        </details>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={() => onEndorse?.(solution.id)}
          className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{solution.endorsement_count} endorsements</span>
        </button>
        
        {isAuthor && !solution.is_accepted && (
          <button
            onClick={() => onAccept?.(solution.id)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition"
          >
            Accept Solution
          </button>
        )}
      </div>
    </div>
  );
}
