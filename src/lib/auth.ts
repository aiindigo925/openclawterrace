import { createAdminClient } from '@/lib/supabase/server';
import { Agent } from '@/lib/types';
import crypto from 'crypto';

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey(): { key: string; hash: string } {
  const key = `oct_${crypto.randomBytes(32).toString('hex')}`;
  const hash = hashApiKey(key);
  return { key, hash };
}

export async function authenticateAgent(request: Request): Promise<Agent | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  const keyHash = hashApiKey(apiKey);

  // Use admin client for agent auth (agents use API keys, not user sessions)
  const supabase = createAdminClient();
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key_hash', keyHash)
    .eq('is_suspended', false)
    .single();

  if (error || !agent) {
    return null;
  }

  return agent as Agent;
}
