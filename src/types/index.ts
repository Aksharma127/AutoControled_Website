// ─── UI Config Types ───────────────────────────────────────────────────────
export type PersonaId = 'explorer' | 'reader' | 'bouncer' | 'unknown';
export type ExperimentCohort = 'control' | 'adaptive';
export type BehaviorMode = 'default' | 'high_speed_skimmer' | 'low_engagement' | 'high_intent';

export type ColorMood = 'calm' | 'energetic' | 'focused';
export type HeroStyle = 'minimal' | 'immersive' | 'compact';

export interface UIConfig {
    cardOrder: number[];        // e.g. [1, 2, 3, 4] or [3, 1, 4, 2]
    navPriority: string[];      // e.g. ['cta', 'about', 'features', 'blog']
    heroStyle: HeroStyle;
    colorMood: ColorMood;
    wobblyIntensity: number;    // 0.0 → 1.0
}

export const DEFAULT_CONFIG: UIConfig = {
    cardOrder: [1, 2, 3, 4],
    navPriority: ['cta', 'about', 'features', 'blog'],
    heroStyle: 'immersive',
    colorMood: 'energetic',
    wobblyIntensity: 0.6,
};

// ─── Session / Tracking Types ──────────────────────────────────────────────
export interface SessionData {
    ip_hash: string;
    avg_x: number;
    avg_y: number;
    scroll_speed: number;
    dwell_seconds: number;
    click_count: number;
    persona_id: PersonaId | null;
    pulse_count: number;
}

export interface PersonaCentroid {
    id: PersonaId;
    centroid_vector: number[];
    trait_description: string;
}

export interface ExperimentState {
    cohort: ExperimentCohort;
    policyVersionId: number | null;
}
