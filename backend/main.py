"""
FastAPI application entry point for AmorePacific skin tone analysis backend.
"""
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory (ensures GEMINI_API_KEY is available)
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="AmorePacific Skin Tone Analysis API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add production URL when ready
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AmorePacific Skin Tone Analysis API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
