"""
Service for matching CIELAB values to foundation shades.
MOCK IMPLEMENTATION - Replace with real foundation matching code.
"""
from typing import List, Dict
from api.models import FoundationShade
import random

def match_shades(cielab: Dict[str, float]) -> List[FoundationShade]:
    """
    Match CIELAB values to foundation shades.
    
    MOCK: Returns 3 random foundation shades with realistic codes and colors.
    TODO: Replace with actual foundation matching logic.
    
    Args:
        cielab: Dictionary with 'L', 'a', 'b' CIELAB values
        
    Returns:
        List of 3 FoundationShade objects with codes (e.g., "W23", "N34.3"),
        ranks, colors, and percentages for pie chart
    """
    # MOCK: Generate foundation shades based on CIELAB values
    # Foundation codes: W (warm), N (neutral), C (cool) + number
    base_shades = [
        {"code": "W23", "rank": "BEST SHADE"},
        {"code": "N21", "rank": "SECOND BEST"},
        {"code": "W21", "rank": "THIRD BEST"},
    ]
    
    # Adjust shades based on lightness
    if cielab["L"] > 70:
        base_shades = [
            {"code": "W21", "rank": "BEST SHADE"},
            {"code": "N20", "rank": "SECOND BEST"},
            {"code": "W20", "rank": "THIRD BEST"},
        ]
    elif cielab["L"] < 55:
        base_shades = [
            {"code": "W25", "rank": "BEST SHADE"},
            {"code": "N26", "rank": "SECOND BEST"},
            {"code": "W24", "rank": "THIRD BEST"},
        ]
    
    # Generate percentages that add up to 100%
    percentages = []
    remaining = 100
    for i in range(len(base_shades) - 1):
        percent = random.uniform(25, 45)
        percentages.append(round(percent, 1))
        remaining -= percent
    percentages.append(round(remaining, 1))
    
    # Shuffle percentages for randomness
    random.shuffle(percentages)
    
    # Generate HSL colors based on CIELAB
    # Convert CIELAB to approximate HSL (simplified)
    lightness = cielab["L"]
    hue = 25 + (cielab["a"] * 2)  # Warm tones
    saturation = 20 + (cielab["b"] * 0.5)
    
    colors = []
    for i, shade in enumerate(base_shades):
        # Vary the color slightly for each shade
        shade_hue = hue + random.uniform(-5, 5)
        shade_sat = max(15, min(50, saturation + random.uniform(-5, 5)))
        shade_light = max(50, min(80, lightness + random.uniform(-10, 10)))
        colors.append(f"hsl({round(shade_hue)}, {round(shade_sat)}%, {round(shade_light)}%)")
    
    return [
        FoundationShade(
            code=base_shades[i]["code"],
            rank=base_shades[i]["rank"],
            color=colors[i],
            percentage=percentages[i]
        )
        for i in range(len(base_shades))
    ]
