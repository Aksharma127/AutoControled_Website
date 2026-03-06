#!/usr/bin/env python3
"""
classify_user.py — Real-time persona inference.

Given a session vector, loads centroids from Supabase and returns the
nearest persona using Euclidean distance. Used by n8n's Python node.

Usage (standalone):
    python classify_user.py --avg_x 0.5 --avg_y 0.3 --scroll_speed 80 --dwell_seconds 45 --click_count 3

Called by n8n:
    Reads JSON from stdin: {"avg_x": 0.5, "avg_y": 0.3, ...}
    Writes JSON to stdout: {"persona_id": "reader", "distance": 1.23}
"""

import os
import sys
import json
import argparse
import numpy as np
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

FEATURE_ORDER = ["avg_x", "avg_y", "scroll_speed", "dwell_seconds", "click_count"]


def load_centroids(supabase):
    response = supabase.table("personas").select("id, centroid_vector").execute()
    centroids = {}
    for row in response.data:
        centroids[row["id"]] = np.array(row["centroid_vector"])
    return centroids


def classify(vector: np.ndarray, centroids: dict) -> tuple[str, float]:
    best_persona = "unknown"
    best_dist = float("inf")
    for persona_id, centroid in centroids.items():
        if len(centroid) != len(vector):
            continue
        dist = np.linalg.norm(vector - centroid)
        if dist < best_dist:
            best_dist = dist
            best_persona = persona_id
    return best_persona, best_dist


def main():
    # Check if called from CLI or stdin (n8n)
    if not sys.stdin.isatty():
        # n8n mode: read JSON from stdin
        raw = sys.stdin.read().strip()
        data = json.loads(raw)
    else:
        # CLI mode
        parser = argparse.ArgumentParser()
        for feat in FEATURE_ORDER:
            parser.add_argument(f"--{feat}", type=float, default=0.0)
        args = parser.parse_args()
        data = vars(args)

    vector = np.array([data.get(f, 0.0) for f in FEATURE_ORDER])

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    centroids = load_centroids(supabase)

    if not centroids:
        result = {"persona_id": "unknown", "distance": -1, "error": "No centroids found. Run kmeans_cluster.py first."}
    else:
        persona_id, distance = classify(vector, centroids)
        result = {"persona_id": persona_id, "distance": round(distance, 4)}

    print(json.dumps(result))


if __name__ == "__main__":
    main()
