
-- Tighten activity_log insert policy: restrict allowed action and entity_type values
DROP POLICY IF EXISTS "authenticated insert activity" ON public.activity_log;
CREATE POLICY "authenticated insert activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND action IN (
      'listing.created','listing.updated','listing.deleted',
      'job.created','job.updated','job.cancelled',
      'platform.created','platform.updated','platform.deleted',
      'auth.login','auth.logout','profile.updated'
    )
    AND (entity_type IS NULL OR entity_type IN ('listing','job','platform','profile'))
  );

-- Restrict Realtime channel subscriptions to user-owned topics.
-- Convention: topic must be "user:<auth.uid()>" or "public:*"
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own realtime topic" ON realtime.messages;
CREATE POLICY "users read own realtime topic" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    realtime.topic() = ('user:' || auth.uid()::text)
    OR realtime.topic() LIKE 'public:%'
  );

DROP POLICY IF EXISTS "users write own realtime topic" ON realtime.messages;
CREATE POLICY "users write own realtime topic" ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    realtime.topic() = ('user:' || auth.uid()::text)
  );
