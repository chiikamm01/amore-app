# amore-app

AmorePacific skin tone analysis application built with React and FastAPI.

## Features

- **Skin Tone Analysis**: Capture video and analyze skin tone using CIELAB color space
- **Foundation Matching**: Get personalized foundation shade recommendations
- **Lipstick Recommendations**: Discover 5 lipstick shades that complement your skin tone
- **AI-Powered Rendering**: Visualize lipstick shades on your face using Gemini AI

## Tech Stack

### Frontend
- React 19
- Vite 7
- React Router DOM
- CSS3 with custom properties

### Backend
- FastAPI
- Python 3.x
- OpenCV for video processing
- Google Gemini API for image generation

## Getting Started

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

4. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

6. Start the server:
```bash
uvicorn main:app --reload
```

## Project Structure

```
amore-app/
├── src/
│   ├── pages/          # React page components
│   ├── context/        # React context providers
│   ├── services/       # API service layer
│   └── assets/         # Static assets
├── backend/
│   ├── api/            # FastAPI routes and models
│   └── services/       # Business logic services
└── public/             # Public assets

```

## License

MIT
