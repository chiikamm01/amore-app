# AmorePacific Backend API

FastAPI backend for skin tone analysis and makeup recommendations.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables and add your Gemini API key:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
# Get your API key from: https://makersuite.google.com/app/apikey
```

4. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Current Implementation Status

**⚠️ MOCK IMPLEMENTATION** - All services currently use mock/test data:

- ✅ `services/skin_tone.py` - Returns random CIELAB values
- ✅ `services/foundation_matcher.py` - Returns mock foundation shades
- ✅ `services/lipstick_extractor.py` - Returns mock lipstick shades
- ✅ `services/lipstick_renderer.py` - Uses Gemini API (needs API key)
- ✅ `api/routes.py` - Full endpoint implementation with mock data

**To replace with real implementations:**
1. Replace mock functions in each service file
2. Update `api/routes.py` to use real video frame extraction
3. Test each service independently

## API Endpoints

### POST /api/analyze
Main analysis endpoint that processes video and returns complete results.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `video` (file)

**Response:**
```json
{
  "skinToneName": "Spring Bright",
  "skinToneDescription": "...",
  "cielab": {"L": 65.5, "a": 12.3, "b": 18.7},
  "foundationShades": [
    {"code": "W23", "rank": "BEST SHADE", "color": "hsl(25, 30%, 65%)", "percentage": 45.5},
    ...
  ],
  "lipstickSwatches": [
    {"color": "#6B3A2E", "label": "Rosewood", "isPrimary": true},
    ...
  ],
  "baseImageUrl": "data:image/png;base64,...",
  "renderImageUrl": "data:image/png;base64,...",
  "renderImageUrlsByLipstick": ["data:image/png;base64,...", ...]
}
```

## Notes

- All mock implementations are clearly marked with `MOCK IMPLEMENTATION` comments
- Replace mock code section by section as you implement real functionality
- Gemini API integration is included but may need adjustment based on actual API response format
