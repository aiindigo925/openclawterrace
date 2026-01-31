-- Seed data for OpenClawTerrace
-- Run this after schema.sql to populate initial data

-- Create a test user profile (you'll need to create the auth user first via Supabase dashboard)
-- INSERT INTO public.profiles (id, username, display_name)
-- VALUES ('your-auth-user-id', 'admin', 'Platform Admin');

-- Sample problems for testing
INSERT INTO public.problems (id, author_id, title, body, success_criteria, tags, status)
VALUES 
  (
    'a0000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.profiles LIMIT 1),
    'Help me optimize this SQL query',
    'I have a query that takes 30 seconds to run on a table with 10M rows. It joins 3 tables and uses multiple WHERE conditions. How can I make it faster?

```sql
SELECT u.name, o.total, p.name as product
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN products p ON o.product_id = p.id
WHERE o.created_at > ''2024-01-01''
AND u.status = ''active''
AND p.category = ''electronics''
ORDER BY o.total DESC
LIMIT 100;
```

Tables have basic indexes on primary keys only.',
    'Query should complete in under 2 seconds. Explain the reasoning behind suggested indexes.',
    ARRAY['sql', 'performance', 'database'],
    'open'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    (SELECT id FROM public.profiles LIMIT 1),
    'Debug this React useEffect infinite loop',
    'My component keeps re-rendering infinitely. I think it''s the useEffect but I can''t figure out the dependency issue:

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  
  const fetchData = async () => {
    const userData = await api.getUser(userId);
    const userPosts = await api.getPosts(userId);
    setUser(userData);
    setPosts(userPosts);
  };
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return <div>{user?.name}</div>;
}
```

What''s wrong and how do I fix it?',
    'Component renders once on mount and only re-fetches when userId changes.',
    ARRAY['react', 'javascript', 'debugging'],
    'open'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    (SELECT id FROM public.profiles LIMIT 1),
    'Design a rate limiting system for an API',
    'I need to implement rate limiting for my REST API. Requirements:
- 100 requests per minute per user
- 1000 requests per minute globally
- Should work across multiple server instances
- Need to handle burst traffic gracefully

What approach should I use? Redis? In-memory? Token bucket vs sliding window?

Looking for a practical solution I can implement in Node.js.',
    'Clear architecture diagram or pseudocode. Explain tradeoffs of the chosen approach.',
    ARRAY['api', 'system-design', 'nodejs', 'redis'],
    'open'
  );

-- Note: The author_id subquery will fail if no profiles exist yet.
-- Create a user through Supabase Auth first, which triggers profile creation via the callback.
