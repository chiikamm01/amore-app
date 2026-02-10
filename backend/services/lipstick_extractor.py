"""
Service for extracting lipstick shades based on skin tone.
MOCK IMPLEMENTATION - Replace with real lipstick extraction code.
"""
from typing import List, Dict
from api.models import LipstickSwatch
import random

def extract_shades(cielab: Dict[str, float]) -> List[LipstickSwatch]:
    """
    Extract 5 lipstick shades based on skin tone.
    
    MOCK: Returns 5 lipstick shades with hex colors and labels.
    TODO: Replace with actual lipstick extraction logic.
    
    Args:
        cielab: Dictionary with 'L', 'a', 'b' CIELAB values
        
    Returns:
        List of 5 LipstickSwatch objects with hex colors, labels, and isPrimary flag
    """
    # MOCK: Generate lipstick shades based on skin tone
    # Warmer skin tones get warmer lipstick shades
    base_hue = 0  # Red base
    
    if cielab["L"] > 70:  # Lighter skin
        shades = [
            {"hex": "#D2691E", "label": "Coral Rose"},
            {"hex": "#CD853F", "label": "Peachy Nude"},
            {"hex": "#DEB887", "label": "Soft Beige"},
            {"hex": "#F4A460", "label": "Sandy Blush"},
            {"hex": "#FFB6C1", "label": "Pink Nude"},
        ]
    elif cielab["L"] < 55:  # Darker skin
        shades = [
            {"hex": "#8B4513", "label": "Rich Brown"},
            {"hex": "#6B3A2E", "label": "Deep Rose"},
            {"hex": "#A0522D", "label": "Terracotta"},
            {"hex": "#CD5C5C", "label": "Warm Red"},
            {"hex": "#B22222", "label": "Burgundy"},
        ]
    else:  # Medium skin
        shades = [
            {"hex": "#6B3A2E", "label": "Rosewood", "isPrimary": True},
            {"hex": "#8B4513", "label": "Cocoa"},
            {"hex": "#A0522D", "label": "Terracotta"},
            {"hex": "#CD853F", "label": "Caramel"},
            {"hex": "#D2691E", "label": "Copper"},
        ]
    
    # Ensure first shade is primary if not specified
    if "isPrimary" not in shades[0]:
        shades[0]["isPrimary"] = True
    
    return [
        LipstickSwatch(
            color=shade["hex"],
            label=shade["label"],
            isPrimary=shade.get("isPrimary", False)
        )
        for shade in shades
    ]
