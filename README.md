# Behavior-Adaptive Interface (BAI)

A behavior-driven web interface that captures anonymous interaction telemetry, classifies visitors into personas, and dynamically reflows the UI to maximize engagement.

---

## 1) Product Goal

BAI should identify returning users (without auth) and automatically serve a layout that outperforms a randomized baseline on engagement metrics.

**Primary success metric**
- Returning-user sessions show higher engagement (click-through rate, dwell time, depth of exploration) than default/randomized layouts.

---

## 2) System Architecture

### Sensor Layer (Frontend)
Capture interaction telemetry from anonymous users:
- Cursor movement coordinates `(x, y)` and click coordinates.
- Scroll velocity and cursor transition frequency.
- Dwell time per section/module (in ms).
- Session timestamps and page metadata.

### Persistence Layer (Supabase/PostgreSQL)
- Hash the user IP into a stable, non-reversible identifier.
- Keep identity login-free: persist a local anonymous ID and blend it with network/device signals before hashing.
- Store events in append-only telemetry tables.
- Aggregate user-level feature summaries for fast model input.

### ML Brain (Python + n8n + Gemini)
- Normalize telemetry into feature vectors.
- Cluster users with K-Means into personas (e.g., `high_speed`, `high_dwell`, `broad_explorer`).
- Use n8n automation to fetch current persona + context and ask Gemini for layout policy recommendations.

### Adaptation Layer (React + Framer Motion)
- Render content modules as physics-enabled nodes.
- Apply dynamic parameters by persona: gravity, friction, repulsion.
- Pull high-interest nodes toward center as confidence rises.
- Keep transitions smooth using a gooey SVG filter and motion interpolation.

---

## 3) Repository Structure

- `src/` — React frontend (adaptive UI, tracker, context state).
- `src/lib/tracker.ts` — interaction telemetry capture logic.
- `src/lib/supabase.ts` — Supabase client integration.
- `ml/` — clustering and classification scripts.
- `supabase/schema.sql` — database schema.
- `n8n/` — automation workflow + Gemini prompt template.

---

## 4) Focused MVP Plan (Do This First)

If you feel distracted, follow this exact sequence and do not skip steps.

### Phase A — Reliable Data Capture
1. Capture events (`mousemove`, `click`, `scroll`, `hover_start`, `hover_end`).
2. Buffer events client-side and batch insert every 2–5 seconds.
3. Add basic input validation and event sampling to control noise.

**Exit criteria**
- At least 95% of generated events are stored in Supabase during local testing.

### Phase B — Stable User Identity
1. Read request IP at edge/server layer.
2. Hash IP with a salt and return only the hash to the client.
3. Attach hash to all telemetry writes.

**Exit criteria**
- Refreshing and revisiting from same IP maps to same `user_hash`.

### Phase C — Baseline ML Persona Assignment
1. Build daily feature aggregation job in Python.
2. Train K-Means model and persist centroid metadata.
3. Assign each user to a persona label.

**Exit criteria**
- Every active user row has a valid persona label.

### Phase D — Adaptive Layout Engine
1. Create node layout state with position + weight.
2. Map persona to physics parameters.
3. Animate transitions in Framer Motion.

**Exit criteria**
- Layout visibly changes between personas without jank.

### Phase E — Agentic Optimization Loop
1. Trigger n8n workflow on persona updates.
2. Query Gemini with constrained prompt + schema.
3. Apply safe, bounded config updates to UI.

**Exit criteria**
- n8n can produce and apply a valid layout policy JSON in under 2s (local).

---

## 5) Data Model (Minimal)

### `telemetry_events`
- `id` (uuid)
- `user_hash` (text)
- `event_type` (text)
- `x` (float, nullable)
- `y` (float, nullable)
- `velocity` (float, nullable)
- `section_id` (text, nullable)
- `ts` (timestamptz)

### `user_features_daily`
- `day` (date)
- `user_hash` (text)
- `avg_scroll_velocity` (float)
- `avg_cursor_speed` (float)
- `total_clicks` (int)
- `avg_section_dwell_ms` (float)
- `sections_explored` (int)

### `user_persona`
- `user_hash` (text)
- `persona` (text)
- `confidence` (float)
- `updated_at` (timestamptz)

---

## 6) Local Development

```bash
npm install
npm run dev
```

Optional Python ML setup:

```bash
cd ml
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Validate an AI-generated UI policy locally:

```bash
cat policy.json | python validate_ui_config.py
```

Persist a validated policy (versions + rollout + active config):

```bash
cat payload.json | python persist_policy.py
```

Run rollback check manually:

```bash
python rollback_policies.py
```

The n8n workflow runs both scripts:
1. `validate_ui_config.py`
2. `persist_policy.py`
3. `rollback_policies.py` (parallel safety check on each schedule run)

Phase 2 (A/B serving + measurement) in frontend:
- Cohort is loaded from `ui_policy_rollouts` (or deterministically derived from hash).
- `control` users get default static config; `adaptive` users get `ui_config`.
- Client logs `impression`, `click`, `scroll_depth`, `section_enter`, `viewport_change`, and `dwell_bucket` to `engagement_events`.

Analytics + rollback SQL (in `supabase/schema.sql`):
- `experiment_event_daily`: daily event rollups by cohort/policy.
- `policy_performance_7d`: 7-day CTR/depth/dwell summary.
- `policy_lift_vs_control_7d`: adaptive lift against control baseline.
- `rollback_underperforming_policies(...)`: auto-revert adaptive policies that underperform control.

Example rollback run:

```sql
select * from rollback_underperforming_policies(100, -0.02, 7);
```

---

## 7) Guardrails

- Do not store raw IPs in persistent tables.
- Keep personalization anonymous; never require auth just to retain layout learning.
- Keep model decisions bounded to safe UI ranges.
- Never allow LLM output to directly execute code.
- Use randomized-control cohorts when evaluating improvement.

---

## 8) Definition of Done

BAI is done when:
1. Returning users are consistently recognized via stable hash identity.
2. Personas are updated from real telemetry, not mock data.
3. Adaptive layouts are visibly different and stable.
4. Engagement metrics improve over randomized baseline with statistically meaningful lift.
