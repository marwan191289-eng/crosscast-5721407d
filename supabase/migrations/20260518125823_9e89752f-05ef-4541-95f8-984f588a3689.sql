create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Unschedule prior cron with same name (idempotent)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'crosscast-process-jobs') then
    perform cron.unschedule('crosscast-process-jobs');
  end if;
end $$;

select cron.schedule(
  'crosscast-process-jobs',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://project--60bc3e00-c9dc-4e10-bd22-5c7860380ea2.lovable.app/api/public/cron/process-jobs',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);