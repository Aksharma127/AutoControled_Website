#!/usr/bin/env python3
"""
kmeans_cluster.py — The "Brain" layer.

Fetches all session rows from Supabase, normalizes behavioral features,
runs K-Means (k=3), and saves centroids back to the `personas` table.

Usage:
    python kmeans_cluster.py
    python kmeans_cluster.py --dry-run   # Print centroids without saving
"""

import os
import json
import argparse
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]   # Use service key for server-side scripts

FEATURE_COLS = ["avg_x", "avg_y", "scroll_speed", "dwell_seconds", "click_count"]
N_CLUSTERS = 3
PERSONA_IDS = ["explorer", "reader", "bouncer"]

PERSONA_TRAITS = {
    "explorer": "High-curiosity, moves mouse widely, moderate scroll, many clicks",
    "reader":   "Static mouse, slow scroll, long dwell time, few clicks",
    "bouncer":  "Fast scroll, short dwell, low click count, edge mouse positions",
}


def fetch_sessions(supabase: Client):
    response = supabase.table("sessions").select(
        "ip_hash, avg_x, avg_y, scroll_speed, dwell_seconds, click_count"
    ).execute()
    rows = response.data
    print(f"[KMeans] Fetched {len(rows)} session rows.")
    return rows


def build_feature_matrix(rows):
    X = []
    ip_hashes = []
    for row in rows:
        try:
            vec = [float(row.get(col, 0) or 0) for col in FEATURE_COLS]
            X.append(vec)
            ip_hashes.append(row["ip_hash"])
        except Exception as e:
            print(f"[KMeans] Skipping row {row.get('ip_hash','?')}: {e}")
    return np.array(X), ip_hashes


def name_cluster(center: np.ndarray) -> str:
    """
    Heuristic persona assignment based on centroid coordinates.
    center = [avg_x, avg_y, scroll_speed, dwell_seconds, click_count]
    """
    scroll_speed = center[2]
    dwell = center[3]
    clicks = center[4]

    if dwell > 60 and scroll_speed < 100:
        return "reader"
    elif scroll_speed > 200 or dwell < 15:
        return "bouncer"
    else:
        return "explorer"


def run_clustering(rows, dry_run=False):
    X, ip_hashes = build_feature_matrix(rows)

    if len(X) < N_CLUSTERS:
        print(f"[KMeans] Not enough data ({len(X)} rows). Need at least {N_CLUSTERS}.")
        return None

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Map cluster indices to persona names
    centroids_raw = scaler.inverse_transform(kmeans.cluster_centers_)
    label_to_persona = {}
    used_personas = set()

    for cluster_idx in range(N_CLUSTERS):
        heuristic = name_cluster(centroids_raw[cluster_idx])
        # Ensure uniqueness
        if heuristic in used_personas:
            remaining = [p for p in PERSONA_IDS if p not in used_personas]
            heuristic = remaining[0] if remaining else f"cluster_{cluster_idx}"
        label_to_persona[cluster_idx] = heuristic
        used_personas.add(heuristic)

    print("\n[KMeans] ── Centroids ─────────────────────────────")
    for cluster_idx in range(N_CLUSTERS):
        persona = label_to_persona[cluster_idx]
        centroid = centroids_raw[cluster_idx].tolist()
        print(f"  {persona}: {dict(zip(FEATURE_COLS, [round(v,2) for v in centroid]))}")

    print(f"\n[KMeans] Label distribution: {dict(zip(*np.unique(labels, return_counts=True)))}")

    if dry_run:
        print("[KMeans] Dry run — not saving to Supabase.")
        return

    return labels, label_to_persona, centroids_raw, ip_hashes


def save_to_supabase(supabase: Client, labels, label_to_persona, centroids_raw, ip_hashes):
    print("\n[KMeans] Saving centroids to `personas` table...")
    for cluster_idx, persona_id in label_to_persona.items():
        centroid = centroids_raw[cluster_idx].tolist()
        supabase.table("personas").upsert({
            "id": persona_id,
            "centroid_vector": centroid,
            "trait_description": PERSONA_TRAITS.get(persona_id, ""),
        }).execute()

    print("[KMeans] Updating `sessions` with persona labels...")
    for i, ip_hash in enumerate(ip_hashes):
        persona_id = label_to_persona[labels[i]]
        supabase.table("sessions").update({"persona_id": persona_id}).eq("ip_hash", ip_hash).execute()

    print(f"[KMeans] ✓ Done. {len(ip_hashes)} sessions labeled.")


def main():
    parser = argparse.ArgumentParser(description="K-Means clustering for Organism personas")
    parser.add_argument("--dry-run", action="store_true", help="Print centroids without saving")
    args = parser.parse_args()

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows = fetch_sessions(supabase)

    result = run_clustering(rows, dry_run=args.dry_run)
    if result and not args.dry_run:
        labels, label_to_persona, centroids_raw, ip_hashes = result
        save_to_supabase(supabase, labels, label_to_persona, centroids_raw, ip_hashes)


if __name__ == "__main__":
    main()
