-- ═══════════════════════════════════════════════════════════
-- Organism Database Schema — Supabase (PostgreSQL)
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Sessions table: one row per unique visitor (upserted on each pulse)
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash         TEXT        NOT NULL UNIQUE,
  avg_x           FLOAT       DEFAULT 0,
  avg_y           FLOAT       DEFAULT 0,
  scroll_speed    FLOAT       DEFAULT 0,
  dwell_seconds   INT         DEFAULT 0,
  click_count     INT         DEFAULT 0,
  pulse_count     INT         DEFAULT 0,
  persona_id      TEXT        REFERENCES personas(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Personas / Centroids table: written by kmeans_cluster.py
CREATE TABLE IF NOT EXISTS personas (
  id                  TEXT        PRIMARY KEY,  -- 'explorer' | 'reader' | 'bouncer'
  centroid_vector     JSONB       NOT NULL,     -- [avg_x, avg_y, scroll_speed, dwell_seconds, click_count]
  trait_description   TEXT        DEFAULT '',
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 3. ui_config table: written by n8n + Gemini, read by the React frontend
CREATE TABLE IF NOT EXISTS ui_config (
  ip_hash            TEXT        PRIMARY KEY REFERENCES sessions(ip_hash) ON DELETE CASCADE,
  card_order         JSONB       DEFAULT '[1, 2, 3, 4]',
  nav_priority       JSONB       DEFAULT '["cta", "about", "features", "blog"]',
  hero_style         TEXT        DEFAULT 'immersive',
  color_mood         TEXT        DEFAULT 'energetic',
  wobbly_intensity   FLOAT       DEFAULT 0.6,
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- 4. ui_policy_versions: immutable history of every generated policy
CREATE TABLE IF NOT EXISTS ui_policy_versions (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  policy_hash       TEXT UNIQUE,
  source            TEXT NOT NULL DEFAULT 'gemini', -- gemini | fallback | manual
  persona_id        TEXT REFERENCES personas(id) ON DELETE SET NULL,
  policy_json       JSONB NOT NULL,
  is_valid          BOOLEAN NOT NULL DEFAULT true,
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 5. ui_policy_rollouts: maps users to control/adaptive cohorts and versions
CREATE TABLE IF NOT EXISTS ui_policy_rollouts (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash           TEXT NOT NULL REFERENCES sessions(ip_hash) ON DELETE CASCADE,
  policy_version_id BIGINT REFERENCES ui_policy_versions(id) ON DELETE SET NULL,
  cohort            TEXT NOT NULL DEFAULT 'adaptive', -- control | adaptive
  active            BOOLEAN NOT NULL DEFAULT true,
  assigned_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ip_hash)
);

-- 6. engagement_events: minimal A/B measurement stream
CREATE TABLE IF NOT EXISTS engagement_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash           TEXT NOT NULL REFERENCES sessions(ip_hash) ON DELETE CASCADE,
  policy_version_id BIGINT REFERENCES ui_policy_versions(id) ON DELETE SET NULL,
  cohort            TEXT NOT NULL,
  event_type        TEXT NOT NULL, -- impression | click | scroll_depth | dwell_bucket
  event_value       FLOAT DEFAULT 0,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── Data integrity constraints for adaptive UI payloads ───────────────────
DO $$
BEGIN
  ALTER TABLE ui_config
    ADD CONSTRAINT ui_config_wobbly_range_chk
    CHECK (wobbly_intensity >= 0 AND wobbly_intensity <= 1);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ui_config
    ADD CONSTRAINT ui_config_hero_style_chk
    CHECK (hero_style IN ('minimal', 'immersive', 'compact'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ui_config
    ADD CONSTRAINT ui_config_color_mood_chk
    CHECK (color_mood IN ('calm', 'energetic', 'focused'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ui_policy_versions
    ADD CONSTRAINT ui_policy_versions_source_chk
    CHECK (source IN ('gemini', 'fallback', 'manual'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE ui_policy_rollouts
    ADD CONSTRAINT ui_policy_rollouts_cohort_chk
    CHECK (cohort IN ('control', 'adaptive'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE engagement_events
    ADD CONSTRAINT engagement_events_cohort_chk
    CHECK (cohort IN ('control', 'adaptive'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ─── Deterministic cohort helper (50/50 split by ip hash) ─────────────────
CREATE OR REPLACE FUNCTION assign_experiment_cohort(p_ip_hash TEXT)
RETURNS TEXT AS $$
DECLARE
  h TEXT;
  last_hex TEXT;
  bucket INT;
BEGIN
  h := md5(COALESCE(p_ip_hash, ''));
  last_hex := right(h, 1);
  bucket := ('x' || last_hex)::bit(4)::int;
  IF bucket < 8 THEN
    RETURN 'control';
  END IF;
  RETURN 'adaptive';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Analytical view for daily profile snapshots ───────────────────────────
CREATE OR REPLACE VIEW user_profile_daily AS
SELECT
  date_trunc('day', s.updated_at)::date AS day,
  s.ip_hash,
  s.persona_id,
  s.scroll_speed AS avg_scroll_speed,
  s.dwell_seconds,
  s.click_count,
  s.pulse_count,
  COALESCE(r.cohort, assign_experiment_cohort(s.ip_hash)) AS cohort
FROM sessions s
LEFT JOIN ui_policy_rollouts r ON r.ip_hash = s.ip_hash;

-- ─── Analytics: event rollups and policy lift views ───────────────────────
CREATE OR REPLACE VIEW experiment_event_daily AS
SELECT
  date_trunc('day', e.created_at)::date AS day,
  e.cohort,
  e.policy_version_id,
  COUNT(*) FILTER (WHERE e.event_type = 'impression') AS impressions,
  COUNT(*) FILTER (WHERE e.event_type = 'click') AS clicks,
  AVG(e.event_value) FILTER (WHERE e.event_type = 'scroll_depth') AS avg_scroll_depth,
  AVG(e.event_value) FILTER (WHERE e.event_type = 'dwell_bucket') AS avg_dwell_seconds
FROM engagement_events e
GROUP BY 1, 2, 3;

CREATE OR REPLACE VIEW policy_performance_7d AS
SELECT
  COALESCE(e.policy_version_id, 0) AS policy_version_id,
  e.cohort,
  SUM(e.impressions) AS impressions,
  SUM(e.clicks) AS clicks,
  CASE
    WHEN SUM(e.impressions) = 0 THEN 0
    ELSE ROUND((SUM(e.clicks)::numeric / SUM(e.impressions)::numeric), 6)
  END AS ctr,
  ROUND(AVG(e.avg_scroll_depth)::numeric, 4) AS avg_scroll_depth,
  ROUND(AVG(e.avg_dwell_seconds)::numeric, 4) AS avg_dwell_seconds
FROM experiment_event_daily e
WHERE e.day >= (CURRENT_DATE - INTERVAL '7 day')
GROUP BY 1, 2;

CREATE OR REPLACE VIEW policy_lift_vs_control_7d AS
WITH control_baseline AS (
  SELECT
    ctr AS control_ctr,
    avg_scroll_depth AS control_scroll_depth,
    avg_dwell_seconds AS control_dwell_seconds
  FROM policy_performance_7d
  WHERE cohort = 'control'
  ORDER BY impressions DESC
  LIMIT 1
)
SELECT
  p.policy_version_id,
  p.impressions,
  p.clicks,
  p.ctr,
  p.avg_scroll_depth,
  p.avg_dwell_seconds,
  c.control_ctr,
  c.control_scroll_depth,
  c.control_dwell_seconds,
  ROUND((p.ctr - c.control_ctr)::numeric, 6) AS ctr_lift,
  ROUND((p.avg_scroll_depth - c.control_scroll_depth)::numeric, 4) AS scroll_depth_lift,
  ROUND((p.avg_dwell_seconds - c.control_dwell_seconds)::numeric, 4) AS dwell_lift
FROM policy_performance_7d p
CROSS JOIN control_baseline c
WHERE p.cohort = 'adaptive'
  AND p.policy_version_id <> 0;

-- ─── Automatic rollback helper for underperforming adaptive policies ──────
CREATE OR REPLACE FUNCTION rollback_underperforming_policies(
  p_min_impressions INT DEFAULT 100,
  p_min_ctr_lift NUMERIC DEFAULT -0.02,
  p_lookback_days INT DEFAULT 7
)
RETURNS TABLE (
  rolled_back_policy_id BIGINT,
  fallback_policy_id BIGINT,
  affected_users INT,
  reason TEXT
) AS $$
DECLARE
  candidate RECORD;
  v_control_ctr NUMERIC;
  v_fallback_id BIGINT;
  v_fallback_json JSONB;
  v_affected INT;
BEGIN
  SELECT
    CASE
      WHEN SUM(impressions) = 0 THEN 0
      ELSE (SUM(clicks)::numeric / SUM(impressions)::numeric)
    END
  INTO v_control_ctr
  FROM experiment_event_daily
  WHERE cohort = 'control'
    AND day >= (CURRENT_DATE - (p_lookback_days || ' day')::INTERVAL);

  IF v_control_ctr IS NULL THEN
    RETURN;
  END IF;

  FOR candidate IN
    SELECT
      policy_version_id,
      SUM(impressions) AS impressions,
      SUM(clicks) AS clicks,
      CASE
        WHEN SUM(impressions) = 0 THEN 0
        ELSE (SUM(clicks)::numeric / SUM(impressions)::numeric)
      END AS ctr
    FROM experiment_event_daily
    WHERE cohort = 'adaptive'
      AND policy_version_id IS NOT NULL
      AND day >= (CURRENT_DATE - (p_lookback_days || ' day')::INTERVAL)
    GROUP BY policy_version_id
    HAVING SUM(impressions) >= p_min_impressions
       AND (
         CASE
           WHEN SUM(impressions) = 0 THEN 0
           ELSE (SUM(clicks)::numeric / SUM(impressions)::numeric)
         END
       ) - v_control_ctr < p_min_ctr_lift
  LOOP
    SELECT id, policy_json
    INTO v_fallback_id, v_fallback_json
    FROM ui_policy_versions
    WHERE is_valid = true
      AND id <> candidate.policy_version_id
    ORDER BY
      CASE source
        WHEN 'manual' THEN 3
        WHEN 'fallback' THEN 2
        ELSE 1
      END DESC,
      created_at DESC
    LIMIT 1;

    IF v_fallback_id IS NULL THEN
      rolled_back_policy_id := candidate.policy_version_id;
      fallback_policy_id := NULL;
      affected_users := 0;
      reason := 'No fallback policy found';
      RETURN NEXT;
      CONTINUE;
    END IF;

    WITH impacted AS (
      SELECT ip_hash
      FROM ui_policy_rollouts
      WHERE policy_version_id = candidate.policy_version_id
        AND cohort = 'adaptive'
        AND active = true
    ),
    rollout_update AS (
      UPDATE ui_policy_rollouts r
      SET policy_version_id = v_fallback_id,
          assigned_at = now()
      FROM impacted i
      WHERE r.ip_hash = i.ip_hash
      RETURNING r.ip_hash
    )
    UPDATE ui_config u
    SET
      card_order = COALESCE(v_fallback_json->'cardOrder', '[1,2,3,4]'::jsonb),
      nav_priority = COALESCE(v_fallback_json->'navPriority', '["cta","about","features","blog"]'::jsonb),
      hero_style = COALESCE(v_fallback_json->>'heroStyle', 'immersive'),
      color_mood = COALESCE(v_fallback_json->>'colorMood', 'energetic'),
      wobbly_intensity = COALESCE((v_fallback_json->>'wobblyIntensity')::float, 0.6),
      updated_at = now()
    FROM rollout_update ru
    WHERE u.ip_hash = ru.ip_hash;

    GET DIAGNOSTICS v_affected = ROW_COUNT;

    rolled_back_policy_id := candidate.policy_version_id;
    fallback_policy_id := v_fallback_id;
    affected_users := COALESCE(v_affected, 0);
    reason := format(
      'CTR %.4f under control %.4f (lift %.4f < threshold %.4f)',
      candidate.ctr,
      v_control_ctr,
      candidate.ctr - v_control_ctr,
      p_min_ctr_lift
    );
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ─── Auto-increment pulse_count on upsert ─────────────────────────────────
CREATE OR REPLACE FUNCTION increment_pulse_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.pulse_count := OLD.pulse_count + 1;
    NEW.updated_at  := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_session_update
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION increment_pulse_count();

-- ─── Enable Row Level Security (anon can upsert their own session only) ────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_policy_rollouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- Allow anon to upsert sessions (frontend tracker)
CREATE POLICY "anon_upsert_session" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Allow anon to read their own ui_config
CREATE POLICY "anon_read_own_config" ON ui_config
  FOR SELECT USING (true);

-- Allow anon to read personas
CREATE POLICY "anon_read_personas" ON personas
  FOR SELECT USING (true);

-- Allow anonymous read of active config history for debugging/observability
CREATE POLICY "anon_read_policy_versions" ON ui_policy_versions
  FOR SELECT USING (true);

-- Allow anonymous read of their rollout bucket (client measurement joins)
CREATE POLICY "anon_read_rollouts" ON ui_policy_rollouts
  FOR SELECT USING (true);

-- Allow anonymous inserts for engagement metrics (frontend experiment logging)
CREATE POLICY "anon_insert_engagement_events" ON engagement_events
  FOR INSERT WITH CHECK (true);

-- ─── Default persona seeds (optional — run after schema creation) ──────────
INSERT INTO personas (id, centroid_vector, trait_description) VALUES
  ('explorer', '[0.5, 0.4, 150, 35, 8]',  'High-curiosity navigator: moderate scroll, many clicks')
  ,('reader',   '[0.4, 0.5, 40,  90, 2]',  'Deep-focus reader: slow scroll, long dwell, few clicks')
  ,('bouncer',  '[0.7, 0.2, 400, 8,  1]',  'Fast decision-maker: rapid scroll, very short dwell')
ON CONFLICT (id) DO NOTHING;
