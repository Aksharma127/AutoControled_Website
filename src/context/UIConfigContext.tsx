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
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    async function loadConfig() {
        const [remoteExperiment, remoteConfig, remotePersona] = await Promise.all([
            fetchExperimentState(),
            fetchUIConfig(),
            fetchPersona(),
        ]);
        if (remoteExperiment) setExperiment(remoteExperiment);
        if (remoteConfig) setConfig(remoteConfig);
        if (remotePersona) setPersona(remotePersona);
        setIsLoading(false);
    }

    useEffect(() => {
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

    return (
        <UIConfigContext.Provider value={{ config, persona, experiment, isLoading }}>
            {children}
        </UIConfigContext.Provider>
    );
}
