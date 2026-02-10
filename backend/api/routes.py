"""
API route definitions.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import base64
from PIL import Image
import io
import cv2
import numpy as np
from api.models import AnalysisResponse, CIELAB
from services.skin_tone import extract_cielab
from services.foundation_matcher import match_shades
from services.lipstick_extractor import extract_shades
from services.lipstick_renderer import render_images

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_video(video: UploadFile = File(...)):
    """
    Main analysis endpoint.
    Receives video file and returns complete analysis result.
    
    MOCK IMPLEMENTATION - All services use mock data for testing.
    """
    print(f"API /analyze called - processing video...")
    try:
        # Save uploaded video to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_video:
            content = await video.read()
            tmp_video.write(content)
            tmp_video_path = tmp_video.name
        
        try:
            # Step 1: Extract CIELAB values from video
            cielab_dict = extract_cielab(tmp_video_path)
            cielab = CIELAB(**cielab_dict)
            
            # Step 2: Match foundation shades
            foundation_shades = match_shades(cielab_dict)
            
            # Step 3: Extract lipstick shades
            lipstick_swatches = extract_shades(cielab_dict)
            
            # Step 4: Extract frame from video for base image
            # Extract a frame from the middle of the video (or at 0.5 seconds)
            try:
                cap = cv2.VideoCapture(tmp_video_path)
                if not cap.isOpened():
                    raise Exception("Could not open video file")
                
                # Get video properties
                fps = cap.get(cv2.CAP_PROP_FPS)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                duration = frame_count / fps if fps > 0 else 0
                
                # Seek to middle of video (or 0.5 seconds, whichever is smaller)
                target_time = min(0.5, duration / 2) if duration > 0 else 0.5
                target_frame = int(target_time * fps) if fps > 0 else frame_count // 2
                
                cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
                ret, frame = cap.read()
                cap.release()
                
                if not ret or frame is None:
                    raise Exception("Could not read frame from video")
                
                # Convert BGR to RGB (OpenCV uses BGR, PIL uses RGB)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Convert to PIL Image
                base_image = Image.fromarray(frame_rgb)
                
                # Convert to base64 for response
                img_buffer = io.BytesIO()
                base_image.save(img_buffer, format='PNG', quality=95)
                base_image_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                base_image_url = f"data:image/png;base64,{base_image_base64}"
                
                # Save base image temporarily for lipstick rendering
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_image:
                    base_image.save(tmp_image.name, format='PNG')
                    tmp_image_path = tmp_image.name
                    
            except Exception as frame_err:
                print(f"Warning: Video frame extraction failed: {frame_err}")
                # Fallback: Create a placeholder image
                base_image = Image.new('RGB', (400, 600), color=(240, 220, 200))
                img_buffer = io.BytesIO()
                base_image.save(img_buffer, format='PNG')
                base_image_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                base_image_url = f"data:image/png;base64,{base_image_base64}"
                
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_image:
                    base_image.save(tmp_image.name, format='PNG')
                    tmp_image_path = tmp_image.name
            
            try:
                # Step 5: Render lipstick images using Gemini
                lipstick_colors = [swatch.color for swatch in lipstick_swatches]
                rendered_image_urls = render_images(tmp_image_path, lipstick_colors)
                
                # Get primary lipstick rendered image
                primary_index = next(
                    (i for i, swatch in enumerate(lipstick_swatches) if swatch.isPrimary),
                    0
                )
                render_image_url = rendered_image_urls[primary_index]
                
            finally:
                # Cleanup temporary image file
                if os.path.exists(tmp_image_path):
                    os.unlink(tmp_image_path)
            
            # Step 6: Generate skin tone name and description
            # MOCK: Generate based on CIELAB values
            if cielab.L > 70:
                skin_tone_name = "Spring Bright"
                skin_tone_description = "Your skin tone has a bright, luminous quality with warm undertones. You have a fresh, radiant complexion that works beautifully with warm, peachy tones."
            elif cielab.L < 55:
                skin_tone_name = "Autumn Deep"
                skin_tone_description = "Your skin tone has rich, deep warmth with golden undertones. You have a sophisticated, earthy complexion that pairs beautifully with rich, warm colors."
            else:
                skin_tone_name = "Spring Warm"
                skin_tone_description = "Your skin tone has a warm, golden quality with balanced undertones. You have a natural, sun-kissed complexion that complements warm, coral-based shades."
            
            # Build response
            response = AnalysisResponse(
                skinToneName=skin_tone_name,
                skinToneDescription=skin_tone_description,
                cielab=cielab,
                foundationShades=foundation_shades,
                lipstickSwatches=lipstick_swatches,
                baseImageUrl=base_image_url,
                renderImageUrl=render_image_url,
                renderImageUrlsByLipstick=rendered_image_urls
            )
            
            return response
            
        finally:
            # Cleanup temporary video file
            if os.path.exists(tmp_video_path):
                os.unlink(tmp_video_path)
                
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
