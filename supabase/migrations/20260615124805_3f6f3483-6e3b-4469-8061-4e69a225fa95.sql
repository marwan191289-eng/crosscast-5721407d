
-- 1) Per-user feed token for XML feed URL gating
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS feed_token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');

-- 2) Lock down publish_jobs writes so users can only reference their own listings and platforms
DROP POLICY IF EXISTS "owners manage jobs" ON public.publish_jobs;

CREATE POLICY "owners select jobs" ON public.publish_jobs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owners insert jobs" ON public.publish_jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.listings  l WHERE l.id = listing_id  AND l.user_id  = auth.uid())
    AND EXISTS (SELECT 1 FROM public.platforms p WHERE p.id = platform_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owners update jobs" ON public.publish_jobs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.listings  l WHERE l.id = listing_id  AND l.user_id  = auth.uid())
    AND EXISTS (SELECT 1 FROM public.platforms p WHERE p.id = platform_id AND p.user_id = auth.uid())
  );

CREATE POLICY "owners delete jobs" ON public.publish_jobs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
