#!/usr/bin/env python3
"""
validate_ui_config.py

Safety validator for AI-generated ui_config payloads.

Input:
  - stdin JSON object, OR
  - --file path/to/payload.json

Output:
  - JSON object with validation result and sanitized config.
  - exits with code 0 for valid, 1 for invalid.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from typing import Any, Dict, List


DEFAULT_CONFIG = {
    "cardOrder": [1, 2, 3, 4],
    "navPriority": ["cta", "about", "features", "blog"],
    "heroStyle": "immersive",
    "colorMood": "energetic",
    "wobblyIntensity": 0.6,
}

ALLOWED_HERO = {"minimal", "immersive", "compact"}
ALLOWED_MOOD = {"calm", "energetic", "focused"}
ALLOWED_NAV = {"cta", "about", "features", "blog"}
ALLOWED_CARDS = {1, 2, 3, 4}

ACCENT_HEX = {
    "calm": "#14B8A6",
    "energetic": "#0EA5E9",
    "focused": "#3B82F6",
}
BG_HEX = "#09090B"
TEXT_HEX = "#FAFAFA"


@dataclass
class ValidationResult:
    valid: bool
    errors: List[str]
    warnings: List[str]
    sanitized: Dict[str, Any]


def hex_to_rgb(value: str) -> tuple[float, float, float]:
    value = value.strip().lstrip("#")
    if len(value) != 6:
        raise ValueError("hex color must be 6 chars")
    return tuple(int(value[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def linearize(channel: float) -> float:
    if channel <= 0.03928:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color: str) -> float:
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def contrast_ratio(hex_a: str, hex_b: str) -> float:
    l1 = relative_luminance(hex_a)
    l2 = relative_luminance(hex_b)
    lighter, darker = (l1, l2) if l1 > l2 else (l2, l1)
    return (lighter + 0.05) / (darker + 0.05)


def parse_payload(args: argparse.Namespace) -> Dict[str, Any]:
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            return json.load(f)
    raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("empty input")
    return json.loads(raw)


def sanitize(payload: Dict[str, Any]) -> ValidationResult:
    errors: List[str] = []
    warnings: List[str] = []
    result = dict(DEFAULT_CONFIG)

    card_order = payload.get("cardOrder")
    if isinstance(card_order, list) and len(card_order) == 4:
        try:
            cards = [int(x) for x in card_order]
            if set(cards) == ALLOWED_CARDS:
                result["cardOrder"] = cards
            else:
                errors.append("cardOrder must contain [1,2,3,4] exactly once")
        except Exception:
            errors.append("cardOrder must be numeric")
    elif card_order is not None:
        errors.append("cardOrder must be a 4-item array")

    nav_priority = payload.get("navPriority")
    if isinstance(nav_priority, list) and len(nav_priority) == 4:
        nav = [str(x) for x in nav_priority]
        if set(nav) == ALLOWED_NAV:
            result["navPriority"] = nav
        else:
            errors.append("navPriority must contain cta/about/features/blog exactly once")
    elif nav_priority is not None:
        errors.append("navPriority must be a 4-item array")

    hero_style = payload.get("heroStyle")
    if isinstance(hero_style, str):
        if hero_style in ALLOWED_HERO:
            result["heroStyle"] = hero_style
        else:
            errors.append("heroStyle is invalid")

    color_mood = payload.get("colorMood")
    if isinstance(color_mood, str):
        if color_mood in ALLOWED_MOOD:
            result["colorMood"] = color_mood
        else:
            errors.append("colorMood is invalid")

    wobble = payload.get("wobblyIntensity")
    if wobble is not None:
        try:
            w = float(wobble)
            if 0 <= w <= 1:
                result["wobblyIntensity"] = round(w, 2)
            else:
                errors.append("wobblyIntensity must be between 0 and 1")
        except Exception:
            errors.append("wobblyIntensity must be numeric")

    # WCAG checks for base text and accent color against page background.
    text_contrast = contrast_ratio(TEXT_HEX, BG_HEX)
    if text_contrast < 4.5:
        warnings.append(f"text contrast below WCAG AA (ratio={text_contrast:.2f})")

    accent = ACCENT_HEX[result["colorMood"]]
    accent_contrast = contrast_ratio(accent, BG_HEX)
    if accent_contrast < 3.0:
        warnings.append(
            f"accent contrast low for {result['colorMood']} (ratio={accent_contrast:.2f})"
        )

    valid = len(errors) == 0
    return ValidationResult(valid=valid, errors=errors, warnings=warnings, sanitized=result)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate/sanitize ui_config payload")
    parser.add_argument("--file", type=str, default="")
    args = parser.parse_args()

    try:
        payload = parse_payload(args)
    except Exception as e:
        print(
            json.dumps(
                {
                    "valid": False,
                    "errors": [f"invalid input: {str(e)}"],
                    "warnings": [],
                    "sanitized": DEFAULT_CONFIG,
                }
            )
        )
        return 1

    result = sanitize(payload)
    print(
        json.dumps(
            {
                "valid": result.valid,
                "errors": result.errors,
                "warnings": result.warnings,
                "sanitized": result.sanitized,
            }
        )
    )
    return 0 if result.valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
