#!/usr/bin/env python3
"""
rollback_policies.py

Executes rollback_underperforming_policies(...) in Supabase and prints JSON.
Designed for n8n executeCommand or cron usage.
"""

from __future__ import annotations

import json
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]


def main() -> int:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    try:
        res = supabase.rpc(
            "rollback_underperforming_policies",
            {
                "p_min_impressions": 100,
                "p_min_ctr_lift": -0.02,
                "p_lookback_days": 7,
            },
        ).execute()
        print(json.dumps({"ok": True, "rows": res.data or []}))
        return 0
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
