-- Enable Row Level Security on generation_requests table
ALTER TABLE "generation_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Policy: Users can only SELECT their own generation requests
CREATE POLICY "Users can view own generations" ON "generation_requests"
  FOR SELECT
  USING (user_id = auth.uid());--> statement-breakpoint

-- Policy: Users can INSERT generation requests for themselves
CREATE POLICY "Users can create own generations" ON "generation_requests"
  FOR INSERT
  WITH CHECK (user_id = auth.uid());--> statement-breakpoint

-- Policy: Users can UPDATE their own generation requests
CREATE POLICY "Users can update own generations" ON "generation_requests"
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());--> statement-breakpoint

-- Policy: Users can DELETE their own generation requests
CREATE POLICY "Users can delete own generations" ON "generation_requests"
  FOR DELETE
  USING (user_id = auth.uid());--> statement-breakpoint

-- Enable Row Level Security on iteration_snapshots table
ALTER TABLE "iteration_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- Policy: Users can only SELECT iteration snapshots for their own generation requests
CREATE POLICY "Users can view own iteration snapshots" ON "iteration_snapshots"
  FOR SELECT
  USING (
    generation_request_id IN (
      SELECT id FROM generation_requests WHERE user_id = auth.uid()
    )
  );--> statement-breakpoint

-- Policy: Users can INSERT iteration snapshots for their own generation requests
CREATE POLICY "Users can create own iteration snapshots" ON "iteration_snapshots"
  FOR INSERT
  WITH CHECK (
    generation_request_id IN (
      SELECT id FROM generation_requests WHERE user_id = auth.uid()
    )
  );--> statement-breakpoint

-- Policy: Users can UPDATE iteration snapshots for their own generation requests
CREATE POLICY "Users can update own iteration snapshots" ON "iteration_snapshots"
  FOR UPDATE
  USING (
    generation_request_id IN (
      SELECT id FROM generation_requests WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    generation_request_id IN (
      SELECT id FROM generation_requests WHERE user_id = auth.uid()
    )
  );--> statement-breakpoint

-- Policy: Users can DELETE iteration snapshots for their own generation requests
CREATE POLICY "Users can delete own iteration snapshots" ON "iteration_snapshots"
  FOR DELETE
  USING (
    generation_request_id IN (
      SELECT id FROM generation_requests WHERE user_id = auth.uid()
    )
  );--> statement-breakpoint

-- Service role bypass: Allow server-side operations (using Supabase service role)
-- The server connects with DATABASE_URL which uses the postgres role, not anon/authenticated
-- This means RLS policies apply to the frontend Supabase client calls, not our server
-- If needed, we can grant the service role bypass:
-- ALTER TABLE "generation_requests" FORCE ROW LEVEL SECURITY;
-- ALTER TABLE "iteration_snapshots" FORCE ROW LEVEL SECURITY;
