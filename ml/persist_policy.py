#!/usr/bin/env python3
"""
persist_policy.py

Persists a validated UI policy to Supabase:
1) upsert into ui_policy_versions
2) upsert user rollout assignment (control/adaptive)
3) upsert active ui_config

Input (stdin JSON):
{
  "ip_hash": "...",
  "policy_source": "gemini|fallback|manual",
  "validation_errors": [],
  "validator": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "sanitized": { ...ui_config }
  }
}
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
from typing import Any, Dict, List

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]


def default_config() -> Dict[str, Any]:
    return {
        "cardOrder": [1, 2, 3, 4],
        "navPriority": ["cta", "about", "features", "blog"],
        "heroStyle": "immersive",
        "colorMood": "energetic",
        "wobblyIntensity": 0.6,
    }


def derive_cohort(ip_hash: str) -> str:
    digest = hashlib.md5(ip_hash.encode("utf-8")).hexdigest()
    bucket = int(digest[-1], 16)
    return "control" if bucket < 8 else "adaptive"


def read_stdin_json() -> Dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("empty stdin")
    return json.loads(raw)


def normalize(payload: Dict[str, Any]) -> Dict[str, Any]:
    validator = payload.get("validator") if isinstance(payload.get("validator"), dict) else {}
    sanitized = validator.get("sanitized")
    if not isinstance(sanitized, dict):
        sanitized = default_config()

    errors: List[str] = []
    errors.extend(payload.get("validation_errors", []) if isinstance(payload.get("validation_errors"), list) else [])
    errors.extend(validator.get("errors", []) if isinstance(validator.get("errors"), list) else [])

    source = str(payload.get("policy_source", "gemini"))
    if errors and source == "gemini":
        source = "fallback"

    return {
        "ip_hash": str(payload.get("ip_hash", "")),
        "source": source,
        "policy_json": sanitized,
        "validation_errors": errors,
        "is_valid": len(errors) == 0,
    }


def main() -> int:
    try:
        payload = read_stdin_json()
        data = normalize(payload)
        ip_hash = data["ip_hash"]
        if not ip_hash:
            raise ValueError("ip_hash missing")
    except Exception as e:
        print(json.dumps({"ok": False, "error": f"invalid_input: {e}"}))
        return 1

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    policy_json = data["policy_json"]
    policy_hash = hashlib.sha256(
        json.dumps(policy_json, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()

    try:
        version_row = {
            "policy_hash": policy_hash,
            "source": data["source"],
            "policy_json": policy_json,
            "is_valid": data["is_valid"],
            "validation_errors": data["validation_errors"],
        }
        version_res = (
            supabase.table("ui_policy_versions")
            .upsert(version_row, on_conflict="policy_hash")
            .execute()
        )
        version_data = version_res.data[0] if version_res.data else None

        if version_data and "id" in version_data:
            policy_version_id = version_data["id"]
        else:
            lookup = (
                supabase.table("ui_policy_versions")
                .select("id")
                .eq("policy_hash", policy_hash)
                .limit(1)
                .execute()
            )
            if not lookup.data:
                raise RuntimeError("policy version lookup failed")
            policy_version_id = lookup.data[0]["id"]

        cohort = derive_cohort(ip_hash)
        supabase.table("ui_policy_rollouts").upsert(
            {
                "ip_hash": ip_hash,
                "policy_version_id": policy_version_id,
                "cohort": cohort,
                "active": True,
            },
            on_conflict="ip_hash",
        ).execute()

        supabase.table("ui_config").upsert(
            {
                "ip_hash": ip_hash,
                "card_order": policy_json["cardOrder"],
                "nav_priority": policy_json["navPriority"],
                "hero_style": policy_json["heroStyle"],
                "color_mood": policy_json["colorMood"],
                "wobbly_intensity": policy_json["wobblyIntensity"],
            },
            on_conflict="ip_hash",
        ).execute()

        print(
            json.dumps(
                {
                    "ok": True,
                    "ip_hash": ip_hash,
                    "policy_version_id": policy_version_id,
                    "policy_hash": policy_hash,
                    "cohort": cohort,
                    "source": data["source"],
                }
            )
        )
        return 0
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e), "ip_hash": ip_hash}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
