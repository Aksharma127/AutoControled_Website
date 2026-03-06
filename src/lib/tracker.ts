/**
 * tracker.ts — The "Sensors" layer.
 * Captures mouse XY, scroll velocity, dwell time and click count.
 * Sends a "pulse" to Supabase every 10 seconds, identified by an IP hash.
 */

import { supabase } from './supabase';
import type {
    ExperimentCohort,
    ExperimentState,
    PersonaId,
    SessionData,
    UIConfig,
} from '../types';

// ─── Fingerprint ───────────────────────────────────────────────────────────
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getOrCreateAnonymousId(): string {
    const storageKey = 'bai_anonymous_id';
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;

    const generated = crypto.randomUUID();
    localStorage.setItem(storageKey, generated);
    return generated;
}

async function fetchPublicIp(timeoutMs = 1200): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal,
        });
        const body = (await res.json()) as { ip?: string };
        return body.ip ?? null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

async function getIpHash(): Promise<string> {
    const anonymousId = getOrCreateAnonymousId();
    const ip = await fetchPublicIp();
    const stableFingerprint = `${ip ?? 'no-ip'}|${anonymousId}|${navigator.userAgent}|${screen.width}x${screen.height}|${navigator.language}`;

    return sha256(stableFingerprint);
}

function deriveCohortFromHash(hash: string): ExperimentCohort {
    const nibble = parseInt(hash.slice(-1), 16);
    if (Number.isNaN(nibble)) return 'adaptive';
    return nibble < 8 ? 'control' : 'adaptive';
}

// ─── Rolling buffers ───────────────────────────────────────────────────────
let mouseXBuffer: number[] = [];
let mouseYBuffer: number[] = [];
let scrollSpeedBuffer: number[] = [];
let clickCount = 0;
let maxScrollDepthPct = 0;
let lastDepthBucketLogged = 0;
let lastMouseSampleAt = 0;
const dwellStart = Date.now();
let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let initialized = false;
let ipHash = '';
let pulseInterval: ReturnType<typeof setInterval> | null = null;
let experimentState: ExperimentState = { cohort: 'adaptive', policyVersionId: null };
let sectionObserver: IntersectionObserver | null = null;
let enteredSections = new Set<string>();

function onResize() {
    void logEngagement('viewport_change', 1, {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        path: window.location.pathname,
    });
}

// ─── Event Handlers ────────────────────────────────────────────────────────
function onMouseMove(e: MouseEvent) {
    const now = performance.now();
    if (now - lastMouseSampleAt < 80) return;
    lastMouseSampleAt = now;

    // Normalize to 0–1 range
    mouseXBuffer.push(e.clientX / window.innerWidth);
    mouseYBuffer.push(e.clientY / window.innerHeight);
    // Keep buffer manageable
    if (mouseXBuffer.length > 500) mouseXBuffer = mouseXBuffer.slice(-200);
    if (mouseYBuffer.length > 500) mouseYBuffer = mouseYBuffer.slice(-200);
}

function onScroll() {
    const now = Date.now();
    const dy = Math.abs(window.scrollY - lastScrollY);
    const dt = (now - lastScrollTime) / 1000; // seconds
    if (dt > 0) {
        scrollSpeedBuffer.push(dy / dt);
        if (scrollSpeedBuffer.length > 100) scrollSpeedBuffer = scrollSpeedBuffer.slice(-50);
    }
    lastScrollY = window.scrollY;
    lastScrollTime = now;

    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    maxScrollDepthPct = Math.max(maxScrollDepthPct, pct);

    for (const bucket of [25, 50, 75, 100]) {
        if (pct >= bucket && bucket > lastDepthBucketLogged) {
            lastDepthBucketLogged = bucket;
            void logEngagement('scroll_depth', bucket, { path: window.location.pathname });
        }
    }
}

function onClick(e: MouseEvent) {
    clickCount++;
    const target = e.target as HTMLElement | null;
    const targetId = target?.id ?? null;
    const tag = target?.tagName?.toLowerCase() ?? null;
    void logEngagement('click', 1, {
        target_id: targetId,
        tag,
        path: window.location.pathname,
    });
}

// ─── Average helper ────────────────────────────────────────────────────────
function avg(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ─── Pulse (send data to Supabase) ────────────────────────────────────────
async function sendPulse() {
    if (!ipHash) return;

    const dwell = Math.round((Date.now() - dwellStart) / 1000);

    const payload: Partial<SessionData> = {
        ip_hash: ipHash,
        avg_x: parseFloat(avg(mouseXBuffer).toFixed(4)),
        avg_y: parseFloat(avg(mouseYBuffer).toFixed(4)),
        scroll_speed: parseFloat(avg(scrollSpeedBuffer).toFixed(2)),
        dwell_seconds: dwell,
        click_count: clickCount,
    };

    try {
        const { error } = await supabase.from('sessions').upsert(
            {
                ...payload,
                pulse_count: 1, // will be incremented server-side via trigger or handled in Python
            },
            { onConflict: 'ip_hash', ignoreDuplicates: false }
        );

        if (error) {
            console.warn('[Tracker] Supabase upsert error:', error.message);
        } else {
            console.debug('[Tracker] Pulse sent ✓', payload);
        }
    } catch (e) {
        console.warn('[Tracker] Network error:', e);
    }
}

// ─── Engagement event logging ──────────────────────────────────────────────
async function logEngagement(eventType: string, eventValue = 0, metadata: Record<string, unknown> = {}) {
    if (!ipHash) return;

    try {
        const { error } = await supabase.from('engagement_events').insert({
            ip_hash: ipHash,
            policy_version_id: experimentState.policyVersionId,
            cohort: experimentState.cohort,
            event_type: eventType,
            event_value: eventValue,
            metadata: {
                ...metadata,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
            },
        });

        if (error) {
            console.warn('[Tracker] Engagement log error:', error.message);
        }
    } catch (e) {
        console.warn('[Tracker] Engagement network error:', e);
    }
}

// ─── Experiment state ─────────────────────────────────────────────────────
export async function fetchExperimentState(): Promise<ExperimentState> {
    if (!ipHash) return experimentState;

    const derived = deriveCohortFromHash(ipHash);
    const { data, error } = await supabase
        .from('ui_policy_rollouts')
        .select('cohort, policy_version_id, active')
        .eq('ip_hash', ipHash)
        .single();

    if (error || !data || data.active === false) {
        experimentState = { cohort: derived, policyVersionId: null };
        return experimentState;
    }

    const cohort =
        data.cohort === 'control' || data.cohort === 'adaptive'
            ? (data.cohort as ExperimentCohort)
            : derived;

    experimentState = {
        cohort,
        policyVersionId:
            typeof data.policy_version_id === 'number' ? data.policy_version_id : null,
    };

    return experimentState;
}

export function getExperimentState_() {
    return experimentState;
}

// ─── Persona fetcher ──────────────────────────────────────────────────────
export async function fetchPersona(): Promise<PersonaId> {
    if (!ipHash) return 'unknown';
    const { data, error } = await supabase
        .from('sessions')
        .select('persona_id')
        .eq('ip_hash', ipHash)
        .single();

    if (error || !data) return 'unknown';
    return (data.persona_id as PersonaId) || 'unknown';
}

// ─── UIConfig fetcher ─────────────────────────────────────────────────────
export async function fetchUIConfig() {
    if (!ipHash) return null;
    if (experimentState.cohort === 'control') {
        const controlConfig: UIConfig = {
            cardOrder: [1, 2, 3, 4],
            navPriority: ['cta', 'about', 'features', 'blog'],
            heroStyle: 'immersive',
            colorMood: 'energetic',
            wobblyIntensity: 0.6,
        };
        return controlConfig;
    }

    const { data, error } = await supabase
        .from('ui_config')
        .select('*')
        .eq('ip_hash', ipHash)
        .single();

    if (error || !data) return null;
    return {
        cardOrder: data.card_order ?? [1, 2, 3, 4],
        navPriority: data.nav_priority ?? ['cta', 'about', 'features', 'blog'],
        heroStyle: data.hero_style ?? 'immersive',
        colorMood: data.color_mood ?? 'energetic',
        wobblyIntensity: data.wobbly_intensity ?? 0.6,
    };
}

// ─── Init ─────────────────────────────────────────────────────────────────
export async function initTracker() {
    if (initialized) return;
    initialized = true;

    ipHash = await getIpHash();
    experimentState = { cohort: deriveCohortFromHash(ipHash), policyVersionId: null };
    await fetchExperimentState();
    console.info('[Tracker] Session fingerprint:', ipHash.slice(0, 12) + '...');

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
            const target = entry.target as HTMLElement;
            const sectionId = target.id || target.dataset.section || '';
            if (!sectionId || enteredSections.has(sectionId)) continue;
            enteredSections.add(sectionId);
            void logEngagement('section_enter', entry.intersectionRatio, {
                section_id: sectionId,
                path: window.location.pathname,
            });
        }
    }, { threshold: [0.55, 0.8] });

    document.querySelectorAll<HTMLElement>('section[id]').forEach((el) => {
        sectionObserver?.observe(el);
    });

    // First pulse after 5 seconds, then every 10 seconds
    setTimeout(sendPulse, 5000);
    pulseInterval = setInterval(sendPulse, 10000);
    void logEngagement('impression', 1, { path: window.location.pathname });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        if (pulseInterval) clearInterval(pulseInterval);
        void sendPulse(); // final pulse
        const dwellSeconds = Math.round((Date.now() - dwellStart) / 1000);
        void logEngagement('dwell_bucket', dwellSeconds, {
            max_scroll_depth_pct: maxScrollDepthPct,
            clicks: clickCount,
            path: window.location.pathname,
        });
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
        sectionObserver?.disconnect();
        sectionObserver = null;
        enteredSections = new Set<string>();
    });
}

export { ipHash as getIpHash_ };
