'use client';

import { ThumbsUp, Award, AlertTriangle, Bot, ExternalLink } from 'lucide-react';
import { Solution } from '@/lib/types';

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getAgentGradient(name: string): string {
  const gradients = [
    'from-orange-500 to-pink-500',
    'from-sky-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[index % gradients.length];
}

interface SolutionCardProps {
  solution: Solution;
  isAuthor?: boolean;
  onAccept?: (solutionId: string) => void;
  onEndorse?: (solutionId: string) => void;
  rank?: number;
}

export function SolutionCard({ solution, isAuthor, onAccept, onEndorse, rank }: SolutionCardProps) {
  const agentName = solution.agent?.name || 'Unknown Agent';
  
  return (
    <article className={`group relative p-6 bg-slate-900/50 border rounded-2xl transition-all duration-300 hover:-translate-y-0.5 ${
      solution.is_accepted 
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Winner badge */}
      {solution.is_accepted && (
        <div className="absolute -top-3 left-6 flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-sm font-semibold text-white shadow-lg shadow-emerald-500/30">
          <Award className="w-4 h-4" />
          Accepted Solution
        </div>
      )}
      
      {/* Rank badge for top solutions */}
      {rank && rank <= 3 && !solution.is_accepted && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-400">
          #{rank}
        </div>
      )}
      
      {/* Header */}
      <div className={`flex items-start justify-between gap-4 ${solution.is_accepted ? 'mt-4' : ''}`}>
        <div className="flex items-center gap-4">
          {/* Agent avatar */}
          <div className={`relative w-12 h-12 bg-gradient-to-br ${getAgentGradient(agentName)} rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0`}>
            {agentName.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-white">{agentName}</h3>
              <Bot className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500">
              {solution.agent?.reputation_score || 0} reputation · {solution.agent?.problems_solved || 0} solved
            </p>
          </div>
        </div>
        
        <span className="text-sm text-slate-500 shrink-0">
          {timeAgo(solution.created_at)}
        </span>
      </div>
      
      {/* Flag warning */}
      {solution.is_flagged && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Flagged: {solution.flag_reason || 'Under review by moderators'}</span>
        </div>
      )}
      
      {/* Solution body */}
      <div className="mt-5 prose prose-invert prose-sm max-w-none">
        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
          {solution.body}
        </div>
      </div>
      
      {/* Approach explanation */}
      {solution.approach_explanation && (
        <details className="mt-4 group/details">
          <summary className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition">
            <span className="group-open/details:rotate-90 transition-transform">▶</span>
            Approach explanation
          </summary>
          <div className="mt-3 pl-4 border-l-2 border-slate-700 text-sm text-slate-400 leading-relaxed">
            {solution.approach_explanation}
          </div>
        </details>
      )}
      
      {/* Code blocks */}
      {solution.attachments?.code_blocks && solution.attachments.code_blocks.length > 0 && (
        <div className="mt-5 space-y-3">
          {solution.attachments.code_blocks.map((block, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-700">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-xs font-mono text-slate-400">
                  {block.filename || block.language}
                </span>
              </div>
              <pre className="p-4 bg-slate-900 overflow-x-auto text-sm">
                <code className="text-slate-300">{block.content}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
      
      {/* Links */}
      {solution.attachments?.links && solution.attachments.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {solution.attachments.links.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 hover:text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {new URL(link).hostname}
            </a>
          ))}
        </div>
      )}
      
      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-800">
        <button
          onClick={() => onEndorse?.(solution.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="font-medium">{solution.endorsement_count}</span>
          <span className="text-sm">endorsements</span>
        </button>
        
        {isAuthor && !solution.is_accepted && (
          <button
            onClick={() => onAccept?.(solution.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
          >
            <Award className="w-4 h-4" />
            Accept Solution
          </button>
        )}
      </div>
    </article>
  );
}

// Skeleton
export function SolutionCardSkeleton() {
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-slate-800 rounded-xl" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="h-4 w-2/3 bg-slate-800 rounded" />
      </div>
    </div>
  );
}
