"""
Service for rendering lipstick shades on images using Gemini nano-banana (gemini-2.5-flash-image).
"""
from typing import List
import os
import base64
from PIL import Image, ImageDraw
import io
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def render_images(base_image_path: str, lipstick_shades: List[str]) -> List[str]:
    """
    Generate 5 images with different lipstick shades applied using Gemini nano-banana.
    
    Uses gemini-2.5-flash-image model for image editing.
    Falls back to color overlay if API fails.
    
    Args:
        base_image_path: Path to the base image (extracted frame from video)
        lipstick_shades: List of 5 hex color codes for lipstick shades
        
    Returns:
        List of 5 base64 encoded images
    """
    # Read base image for fallback use
    base_image = Image.open(base_image_path).convert('RGB')
    
    rendered_images = []
    
    # Get API key from environment
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    placeholder = api_key in (None, "", "your_api_key_here", "your_gemini_api_key_here")
    use_gemini = api_key and not placeholder
    
    client = None
    if use_gemini:
        try:
            client = genai.Client(api_key=api_key)
            # Configure to return images
            config = types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            )
        except Exception as e:
            print(f"Warning: Gemini client initialization failed: {e}")
            use_gemini = False
            config = None
    else:
        config = None
    
    print(f"render_images called with {len(lipstick_shades)} lipstick shades")
    
    for i, hex_color in enumerate(lipstick_shades):
        try:
            if use_gemini and client and config:
                try:
                    # Use Gemini nano-banana to apply lipstick
                    prompt = f"""Local retouch only. Do not apply any global color grading or lighting changes.
                            Only edit the lips area. Everything else must remain pixel-identical (background, hair, clothing, body, lighting, skin).
                            Lips only: apply lipstick with hex color {hex_color}, soft satin finish, natural lip texture, no overlining. Make it look realistic and professional.
                            Keep the same pose and expression."""
                    
                    # Load image fresh for each request
                    image = Image.open(base_image_path)
                    
                    # Generate edited image using the correct API pattern
                    response = client.models.generate_content(
                        model="gemini-2.5-flash-image",
                        contents=[prompt, image],
                        config=config,
                    )
                    
                    # Extract image from response
                    # Based on example: response has candidates[0].content.parts, and parts have as_image() method
                    saved = False
                    
                    if hasattr(response, 'candidates') and len(response.candidates) > 0:
                        candidate = response.candidates[0]
                        if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                            parts = candidate.content.parts
                            
                            for part in parts:
                                # Try as_image() method first (from example code)
                                if hasattr(part, 'as_image'):
                                    try:
                                        out_image = part.as_image()
                                        # Convert to base64
                                        img_buffer = io.BytesIO()
                                        out_image.save(img_buffer, format='PNG', quality=95)
                                        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                                        rendered_images.append(f"data:image/png;base64,{img_base64}")
                                        saved = True
                                        print(f"Successfully generated image {i+1} using Gemini nano-banana")
                                        break
                                    except Exception as img_err:
                                        print(f"Debug: as_image() failed: {img_err}")
                                        continue
                                
                                # Fallback: try inline_data
                                if hasattr(part, 'inline_data') and part.inline_data:
                                    inline_data = part.inline_data
                                    if hasattr(inline_data, 'data'):
                                        data = inline_data.data
                                        
                                        try:
                                            # Handle different data types
                                            if isinstance(data, bytes):
                                                img = Image.open(io.BytesIO(data))
                                            elif isinstance(data, (io.BytesIO, io.BufferedReader)):
                                                data.seek(0)
                                                img = Image.open(data)
                                            elif isinstance(data, str):
                                                # Try base64 decode
                                                image_bytes = base64.b64decode(data)
                                                img = Image.open(io.BytesIO(image_bytes))
                                            else:
                                                # Try to read if it's a file-like object
                                                if hasattr(data, 'read'):
                                                    data.seek(0)
                                                    img_bytes = data.read()
                                                    img = Image.open(io.BytesIO(img_bytes))
                                                else:
                                                    raise Exception(f"Unknown data type: {type(data)}")
                                            
                                            # Convert to base64
                                            img_buffer = io.BytesIO()
                                            img.save(img_buffer, format='PNG', quality=95)
                                            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                                            rendered_images.append(f"data:image/png;base64,{img_base64}")
                                            saved = True
                                            print(f"Successfully generated image {i+1} using inline_data")
                                            break
                                        except Exception as decode_err:
                                            print(f"Debug: Image decode error: {decode_err}")
                                            continue
                    
                    if not saved:
                        print(f"Warning: No image in Gemini response for shade {i+1}, using fallback")
                        raise Exception("No image data in response")
                    
                    if saved:
                        continue
                    
                except Exception as gemini_error:
                    print(f"Gemini API error for shade {i+1}: {gemini_error}")
                    import traceback
                    print(f"Traceback: {traceback.format_exc()}")
                    # Fall through to overlay method
            
            # Fallback: Simple color overlay method
            img_copy = base_image.copy()
            width, height = img_copy.size
            
            # Create overlay for lips area
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(overlay)
            
            # Convert hex to RGB
            hex_color_clean = hex_color.lstrip('#')
            lip_color_rgb = tuple(int(hex_color_clean[i:i+2], 16) for i in (0, 2, 4))
            
            # Draw lip area (simplified oval shape)
            lip_left = width * 0.35
            lip_right = width * 0.65
            lip_top = height * 0.65
            lip_bottom = height * 0.75
            
            # Draw upper and lower lip
            draw.ellipse([lip_left, lip_top - 3, lip_right, lip_bottom + 2], 
                        fill=(*lip_color_rgb, 200), outline=None)
            draw.ellipse([lip_left, lip_top, lip_right, lip_bottom + 5], 
                        fill=(*lip_color_rgb, 220), outline=None)
            
            # Blend overlay with base image
            img_copy = Image.alpha_composite(img_copy.convert('RGBA'), overlay).convert('RGB')
            
            # Convert to base64
            img_buffer = io.BytesIO()
            img_copy.save(img_buffer, format='PNG', quality=95)
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            rendered_images.append(f"data:image/png;base64,{img_base64}")
            
        except Exception as e:
            print(f"Error rendering lipstick shade {i+1} ({hex_color}): {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            # Fallback: return original image
            img_buffer = io.BytesIO()
            base_image.save(img_buffer, format='PNG')
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
            rendered_images.append(f"data:image/png;base64,{img_base64}")
    
    return rendered_images
