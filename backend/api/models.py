"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel
from typing import List, Optional

class CIELAB(BaseModel):
    """CIELAB color space values."""
    L: float
    a: float
    b: float

class FoundationShade(BaseModel):
    """Foundation shade information."""
    code: str  # e.g., "W23", "N34.3"
    rank: str  # e.g., "BEST SHADE", "SECOND BEST", "THIRD BEST"
    color: str  # HSL or hex color
    percentage: float  # Percentage for pie chart

class LipstickSwatch(BaseModel):
    """Lipstick swatch information."""
    color: str  # Hex code
    label: str  # Lipstick shade name/code
    isPrimary: bool

class AnalysisResponse(BaseModel):
    """Complete analysis result response."""
    skinToneName: str
    skinToneDescription: str
    cielab: CIELAB
    foundationShades: List[FoundationShade]
    lipstickSwatches: List[LipstickSwatch]
    baseImageUrl: str  # URL to extracted frame
    renderImageUrl: str  # URL to primary lipstick rendered image
    renderImageUrlsByLipstick: List[str]  # URLs to all 5 rendered images
