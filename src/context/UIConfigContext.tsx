/**
 * UIConfigContext — The "Config Hook" layer.
 * Fetches ui_config from Supabase on mount, polls every 30s for live updates.
 * All components read from this context to drive layout & style.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    fetchExperimentState,
    fetchUIConfig,
    fetchPersona,
    initTracker,
} from '../lib/tracker';
import type { UIConfig, PersonaId, ExperimentState } from '../types';
import { DEFAULT_CONFIG } from '../types';
import { UIConfigContext } from './UIConfigStore';

export function UIConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<UIConfig>(DEFAULT_CONFIG);
    const [persona, setPersona] = useState<PersonaId>('unknown');
    const [experiment, setExperiment] = useState<ExperimentState>({
        cohort: 'adaptive',
        policyVersionId: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [safeMode, setSafeMode] = useState(false);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const configHistory = useRef<number[]>([]);
    const lastConfigString = useRef<string>('');

    async function loadConfig() {
        if (safeMode) return;

        const [remoteExperiment, remoteConfig, remotePersona] = await Promise.all([
            fetchExperimentState(),
            fetchUIConfig(),
            fetchPersona(),
        ]);

        if (remoteExperiment) setExperiment(remoteExperiment);
        if (remotePersona) setPersona(remotePersona);

        if (remoteConfig) {
            const currentString = JSON.stringify(remoteConfig);
            if (currentString !== lastConfigString.current && lastConfigString.current !== '') {
                // Config changed, track it
                const now = Date.now();
                configHistory.current = configHistory.current.filter(t => now - t < 10000);
                configHistory.current.push(now);

                if (configHistory.current.length >= 3) {
                    console.warn('[Kill-Switch] System instability detected (>3 shifts in 10s). Engaging safe-mode.');
                    setSafeMode(true);
                }
            }
            lastConfigString.current = currentString;
            if (!safeMode) setConfig(remoteConfig);
        }

        setIsLoading(false);
    }

    useEffect(() => {
        // Manual Kill-Switch
        const params = new URLSearchParams(window.location.search);
        if (params.get('disable_ai') === 'true') {
            console.warn('[Kill-Switch] Manual override engaged.');
            setSafeMode(true);
            setIsLoading(false);
            return;
        }

        // Start tracker first (fingerprint + event listeners)
        initTracker().then(() => {
            loadConfig();
            // Poll every 30 seconds for live config updates
            pollRef.current = setInterval(loadConfig, 30000);
        });

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const effectiveConfig = safeMode ? DEFAULT_CONFIG : config;

    return (
        <UIConfigContext.Provider value={{ config: effectiveConfig, persona: safeMode ? 'unknown' : persona, experiment, isLoading }}>
            {children}
        </UIConfigContext.Provider>
    );
}
