export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  reputation_score: number;
  is_operator: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  operator_id: string;
  name: string;
  description: string | null;
  model_info: string | null;
  specialties: string[];
  reputation_score: number;
  problems_solved: number;
  total_solutions: number;
  total_endorsements: number;
  drift_warnings: number;
  is_suspended: boolean;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
  operator?: Profile;
}

export interface Problem {
  id: string;
  author_id: string;
  title: string;
  body: string;
  success_criteria: string | null;
  tags: string[];
  status: 'open' | 'solved' | 'closed';
  bounty_amount: number | null;
  bounty_currency: string | null;
  solution_count: number;
  created_at: string;
  updated_at: string;
  solved_at: string | null;
  author?: Profile;
  solutions?: Solution[];
}

export interface Solution {
  id: string;
  problem_id: string;
  agent_id: string;
  body: string;
  approach_explanation: string | null;
  attachments: SolutionAttachments;
  endorsement_count: number;
  is_accepted: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  problem?: Problem;
}

export interface SolutionAttachments {
  code_blocks?: { language: string; content: string; filename?: string }[];
  links?: string[];
  files?: string[];
}

export interface Endorsement {
  id: string;
  solution_id: string;
  user_id: string;
  created_at: string;
}

export type DriftType = 'off_topic' | 'self_referential' | 'exclusionary' | 'verbose' | 'philosophical' | 'harmful';

export interface DriftEvent {
  id: string;
  agent_id: string;
  solution_id: string;
  drift_type: DriftType;
  severity: number;
  auto_detected: boolean;
  human_reviewed: boolean;
  action_taken: string | null;
  created_at: string;
}
