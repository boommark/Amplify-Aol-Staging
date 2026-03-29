-- =============================================================================
-- Amplify AOL — Foundation Schema Migration
-- Phase 1: All 9 tables covering all 5 phases
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER: auth.user_role()
-- Reads role from app_metadata (user-writable user_metadata is intentionally
-- NOT used here — see PITFALLS.md Pitfall 4)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role')
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ---------------------------------------------------------------------------
-- TABLE 1: allowed_emails
-- Email allowlist for sign-up gating. Only pre-approved addresses can create
-- accounts; all others see the Request Access form.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS allowed_emails (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE CHECK (email = lower(email)),
  added_by    uuid REFERENCES auth.users,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY admin_all_allowed_emails
  ON allowed_emails
  FOR ALL
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- Any authenticated user can check whether their email is on the list
-- (needed during the OAuth callback to decide allow vs request-access)
CREATE POLICY authenticated_select_allowed_emails
  ON allowed_emails
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_allowed_emails_email ON allowed_emails (email);


-- ---------------------------------------------------------------------------
-- TABLE 2: access_requests
-- Non-allowlisted users submit their email + reason; admin approves or
-- rejects, then adds the email to allowed_emails.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  reason      text,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can submit a request for their own email
CREATE POLICY authenticated_insert_own_access_request
  ON access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin can read and update all requests
CREATE POLICY admin_select_access_requests
  ON access_requests
  FOR SELECT
  TO authenticated
  USING (auth.user_role() = 'admin');

CREATE POLICY admin_update_access_requests
  ON access_requests
  FOR UPDATE
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');


-- ---------------------------------------------------------------------------
-- TABLE 3: profiles
-- One row per authenticated user. Mirrors auth.users with app-specific fields.
-- Role here stays in sync with app_metadata via the sync_profile_role trigger.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email         text NOT NULL,
  display_name  text,
  region        text,
  role          text NOT NULL DEFAULT 'teacher'
                  CHECK (role IN ('teacher', 'coordinator', 'national', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY teacher_select_own_profile
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY teacher_update_own_profile
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Coordinators can see all profiles in their region
CREATE POLICY coordinator_select_region_profiles
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'coordinator'
    AND region = (SELECT region FROM profiles WHERE id = auth.uid())
  );

-- National + Admin can see everyone
CREATE POLICY national_admin_select_all_profiles
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('national', 'admin'));

-- Admin can update any profile (for role promotions)
CREATE POLICY admin_update_all_profiles
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- Allow profile creation on first login (insert own row)
CREATE POLICY authenticated_insert_own_profile
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());


-- ---------------------------------------------------------------------------
-- updated_at trigger function (shared by profiles and campaigns)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- sync_profile_role trigger
-- When profiles.role changes, write the new role into auth.users.app_metadata
-- so that auth.user_role() (which reads the JWT's app_metadata) stays in sync.
-- Uses a SECURITY DEFINER function to call auth admin APIs.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_profile_role_to_app_metadata()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update app_metadata.role via the Supabase admin helper
  -- auth.admin_update_user_by_id is available in Supabase's pg extension
  PERFORM auth.admin_update_user_by_id(
    NEW.id,
    jsonb_build_object(
      'app_metadata',
      jsonb_build_object('role', NEW.role)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profile_role
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_profile_role_to_app_metadata();


-- ---------------------------------------------------------------------------
-- TABLE 4: campaigns
-- One campaign per conversation thread. Teachers create campaigns; the AI
-- assistant helps them build a complete marketing kit through dialogue.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title       text,
  status      text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'active', 'archived')),
  region      text,
  event_type  text,
  share_token text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Teachers see only their own campaigns
CREATE POLICY teacher_select_own_campaigns
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY teacher_insert_own_campaigns
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY teacher_update_own_campaigns
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY teacher_delete_own_campaigns
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Coordinators see campaigns in their region
CREATE POLICY coordinator_select_region_campaigns
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'coordinator'
    AND region = (SELECT region FROM profiles WHERE id = auth.uid())
  );

-- National + Admin see all
CREATE POLICY national_admin_select_all_campaigns
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('national', 'admin'));

-- Shared campaigns: anyone with share_token can read (anon OK)
-- Implemented via a separate function / RLS policy on share_token
CREATE POLICY shared_campaign_select
  ON campaigns
  FOR SELECT
  USING (share_token IS NOT NULL AND share_token = current_setting('request.jwt.claims', true)::jsonb ->> 'share_token');

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_region ON campaigns (region);


-- ---------------------------------------------------------------------------
-- TABLE 5: campaign_messages
-- Chat messages for each campaign. role = 'user' | 'assistant' | 'system'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content      text,
  parts        jsonb,
  model        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;

-- Inherit access from campaign ownership (user owns campaign → owns messages)
CREATE POLICY campaign_owner_all_messages
  ON campaign_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_messages.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_messages.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- Coordinators can read messages for campaigns in their region
CREATE POLICY coordinator_select_region_messages
  ON campaign_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.user_role() = 'coordinator'
    AND EXISTS (
      SELECT 1 FROM campaigns
      JOIN profiles ON profiles.id = auth.uid()
      WHERE campaigns.id = campaign_messages.campaign_id
        AND campaigns.region = profiles.region
    )
  );

-- National + Admin can read all
CREATE POLICY national_admin_select_all_messages
  ON campaign_messages
  FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('national', 'admin'));

CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign_id ON campaign_messages (campaign_id);


-- ---------------------------------------------------------------------------
-- TABLE 6: campaign_assets
-- Generated files (images, copy, ad creatives) per campaign.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  asset_type   text NOT NULL CHECK (asset_type IN ('image', 'copy', 'ad_creative', 'quote_image')),
  channel      text CHECK (channel IN ('email', 'whatsapp', 'instagram', 'facebook')),
  content      text,
  s3_key       text,
  s3_url       text,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;

-- Inherit from campaign ownership
CREATE POLICY campaign_owner_all_assets
  ON campaign_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_assets.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_assets.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- National + Admin can read all assets
CREATE POLICY national_admin_select_all_assets
  ON campaign_assets
  FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('national', 'admin'));

CREATE INDEX IF NOT EXISTS idx_campaign_assets_campaign_id ON campaign_assets (campaign_id);


-- ---------------------------------------------------------------------------
-- TABLE 7: campaign_research
-- Stored research results per campaign dimension (7 research dimensions).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_research (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid NOT NULL REFERENCES campaigns ON DELETE CASCADE,
  dimension    text NOT NULL CHECK (
    dimension IN (
      'spirituality', 'mental_health', 'sleep_health',
      'relationships', 'local_idioms', 'cultural_sensitivities', 'seasonal'
    )
  ),
  findings     jsonb NOT NULL,
  sources      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_research ENABLE ROW LEVEL SECURITY;

-- Inherit from campaign ownership
CREATE POLICY campaign_owner_all_research
  ON campaign_research
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_research.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_research.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- National + Admin can read all research
CREATE POLICY national_admin_select_all_research
  ON campaign_research
  FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('national', 'admin'));

CREATE INDEX IF NOT EXISTS idx_campaign_research_campaign_id ON campaign_research (campaign_id);


-- ---------------------------------------------------------------------------
-- TABLE 8: prompts
-- Immutable prompt versioning. Each edit creates a new version row; old rows
-- are never overwritten. Only one active version per key at a time.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL,
  version         int NOT NULL DEFAULT 1,
  template        text NOT NULL,
  model_override  text,
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Enforce at most one active row per key
CREATE UNIQUE INDEX IF NOT EXISTS prompts_one_active_per_key
  ON prompts (key)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_prompts_key_active ON prompts (key, is_active);

-- Admin can CRUD all prompts
CREATE POLICY admin_all_prompts
  ON prompts
  FOR ALL
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');

-- Any authenticated user can read active prompts (needed by AI route handlers)
CREATE POLICY authenticated_select_active_prompts
  ON prompts
  FOR SELECT
  TO authenticated
  USING (is_active = true);


-- ---------------------------------------------------------------------------
-- TABLE 9: ai_executions
-- Execution log for every AI call. Tracks prompt, model, provider, I/O,
-- latency, cost, and status for observability and prompt iteration.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_executions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid REFERENCES campaigns ON DELETE SET NULL,
  prompt_id    uuid REFERENCES prompts,
  prompt_key   text NOT NULL,
  model        text NOT NULL,
  provider     text NOT NULL,
  input        jsonb NOT NULL,
  output       jsonb,
  latency_ms   int,
  cost_cents   int,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'success', 'error')),
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_executions ENABLE ROW LEVEL SECURITY;

-- Admin can read all executions
CREATE POLICY admin_select_all_ai_executions
  ON ai_executions
  FOR SELECT
  TO authenticated
  USING (auth.user_role() = 'admin');

-- Users can read their own executions (via campaign ownership)
CREATE POLICY campaign_owner_select_ai_executions
  ON ai_executions
  FOR SELECT
  TO authenticated
  USING (
    campaign_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = ai_executions.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- Service role / backend inserts executions (anon/authenticated INSERT blocked)
CREATE POLICY service_role_insert_ai_executions
  ON ai_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.user_role() = 'admin');

CREATE INDEX IF NOT EXISTS idx_ai_executions_campaign_id ON ai_executions (campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_executions_prompt_key ON ai_executions (prompt_key);
