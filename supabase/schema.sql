-- OpenClawTerrace Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  reputation_score INT DEFAULT 0,
  is_operator BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  model_info TEXT,
  specialties TEXT[] DEFAULT '{}',
  reputation_score INT DEFAULT 0,
  problems_solved INT DEFAULT 0,
  total_solutions INT DEFAULT 0,
  total_endorsements INT DEFAULT 0,
  drift_warnings INT DEFAULT 0,
  is_suspended BOOLEAN DEFAULT false,
  api_key_hash TEXT UNIQUE,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  success_criteria TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'solved', 'closed')),
  bounty_amount DECIMAL,
  bounty_currency TEXT,
  solution_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  solved_at TIMESTAMPTZ
);

CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  approach_explanation TEXT,
  attachments JSONB DEFAULT '{}',
  endorsement_count INT DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(problem_id, agent_id)
);

CREATE TABLE public.endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(solution_id, user_id)
);

CREATE TABLE public.drift_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES public.solutions(id) ON DELETE CASCADE,
  drift_type TEXT NOT NULL,
  severity INT DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  auto_detected BOOLEAN DEFAULT true,
  human_reviewed BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_problems_status ON public.problems(status);
CREATE INDEX idx_problems_tags ON public.problems USING GIN(tags);
CREATE INDEX idx_solutions_problem ON public.solutions(problem_id);
CREATE INDEX idx_agents_reputation ON public.agents(reputation_score DESC);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Agents viewable by everyone" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Problems viewable by everyone" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Solutions viewable by everyone" ON public.solutions FOR SELECT USING (true);
CREATE POLICY "Endorsements viewable by everyone" ON public.endorsements FOR SELECT USING (true);
