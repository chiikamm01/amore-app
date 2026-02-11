"""
Service for extracting lipstick shades based on skin tone.
MOCK IMPLEMENTATION - Replace with real lipstick extraction code.
"""
from typing import List, Dict
from api.models import LipstickSwatch
import random

def _random_shade_code() -> str:
    """Generate random shade code: W/C/N + 2-digit number (e.g. C23, W97, N41)."""
    letter = random.choice(["W", "C", "N"])
    num = random.randint(10, 99)
    return f"{letter}{num}"

def extract_shades(cielab: Dict[str, float]) -> List[LipstickSwatch]:
    """
    Extract 5 lipstick shades based on skin tone.
    
    MOCK: Returns 5 lipstick shades with hex colors and codes (W/C/N + number).
    TODO: Replace with actual lipstick extraction logic.
    
    Args:
        cielab: Dictionary with 'L', 'a', 'b' CIELAB values
        
    Returns:
        List of 5 LipstickSwatch objects with hex colors, labels, and isPrimary flag
    """
    # MOCK: Generate lipstick shades based on skin tone
    if cielab["L"] > 70:  # Lighter skin
        shades = [
            {"hex": "#D2691E"},
            {"hex": "#CD853F"},
            {"hex": "#DEB887"},
            {"hex": "#F4A460"},
            {"hex": "#FFB6C1"},
        ]
    elif cielab["L"] < 55:  # Darker skin
        shades = [
            {"hex": "#8B4513"},
            {"hex": "#6B3A2E"},
            {"hex": "#A0522D"},
            {"hex": "#CD5C5C"},
            {"hex": "#B22222"},
        ]
    else:  # Medium skin
        shades = [
            {"hex": "#6B3A2E", "isPrimary": True},
            {"hex": "#8B4513"},
            {"hex": "#A0522D"},
            {"hex": "#CD853F"},
            {"hex": "#D2691E"},
        ]
    
    if "isPrimary" not in shades[0]:
        shades[0]["isPrimary"] = True
    
    used = set()
    result = []
    for shade in shades:
        code = _random_shade_code()
        while code in used:
            code = _random_shade_code()
        used.add(code)
        result.append(LipstickSwatch(
            color=shade["hex"],
            label=code,
            isPrimary=shade.get("isPrimary", False)
        ))
    return result
