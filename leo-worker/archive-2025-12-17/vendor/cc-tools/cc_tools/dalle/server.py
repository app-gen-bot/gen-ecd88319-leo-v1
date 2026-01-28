#!/usr/bin/env python3
"""
DALL-E MCP Server

Provides DALL-E image generation capabilities for AI agents through the Model Context Protocol.
Uses OpenAI's DALL-E API to generate, edit, and create variations of images.
"""

import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Literal
import hashlib
import base64
from urllib.parse import urlparse

import httpx
from openai import AsyncOpenAI
from fastmcp import FastMCP
from PIL import Image
import io

# Initialize FastMCP server
mcp = FastMCP("DALL-E Image Generation Server", version="1.0.0")

# Environment configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SAVE_DIR = os.getenv("DALLE_SAVE_DIR", "./generated_images")

# Ensure save directory exists
Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Image metadata storage (in production, use a proper database)
IMAGE_METADATA: Dict[str, Dict[str, Any]] = {}


def generate_filename(prompt: str, model: str, timestamp: str) -> str:
    """Generate a unique filename based on prompt and timestamp."""
    # Create a short hash of the prompt
    prompt_hash = hashlib.md5(prompt.encode()).hexdigest()[:8]
    # Clean prompt for filename (first 30 chars, alphanumeric only)
    clean_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c.isspace()).strip()
    clean_prompt = clean_prompt.replace(" ", "_")[:30]
    
    return f"{model}_{clean_prompt}_{prompt_hash}_{timestamp}.png"


async def download_image(url: str, save_path: Path) -> bool:
    """Download image from URL and save to disk."""
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(url)
            response.raise_for_status()
            
            # Save image
            save_path.write_bytes(response.content)
            return True
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False


async def save_base64_image(base64_data: str, save_path: Path) -> bool:
    """Save base64 encoded image to disk."""
    try:
        # Decode base64
        image_data = base64.b64decode(base64_data)
        
        # Verify it's a valid image
        img = Image.open(io.BytesIO(image_data))
        img.verify()
        
        # Save image
        save_path.write_bytes(image_data)
        return True
    except Exception as e:
        print(f"Error saving base64 image: {e}")
        return False


@mcp.tool()
async def generate_image(
    prompt: str,
    model: Literal["dall-e-2", "dall-e-3"] = "dall-e-3",
    size: Optional[str] = None,
    quality: Literal["standard", "hd"] = "standard",
    style: Literal["vivid", "natural"] = "vivid",
    response_format: Literal["url", "b64_json"] = "url",
    save_locally: bool = True
) -> str:
    """
    Generate an image using DALL-E based on a text prompt.
    
    Args:
        prompt: Text description of the desired image (max 1000 chars for DALL-E 2, 4000 for DALL-E 3)
        model: DALL-E model to use
        size: Image size - DALL-E 2: "256x256", "512x512", "1024x1024" | DALL-E 3: "1024x1024", "1792x1024", "1024x1792"
        quality: Image quality (DALL-E 3 only) - "standard" or "hd"
        style: Image style (DALL-E 3 only) - "vivid" or "natural"
        response_format: Response format - "url" or "b64_json"
        save_locally: Whether to save the image locally
    
    Returns:
        JSON string with image URL/data, local path, and metadata
    """
    if not client:
        return json.dumps({
            "error": "OpenAI API key not configured",
            "message": "Please set the OPENAI_API_KEY environment variable"
        }, indent=2)
    
    # Set default size based on model
    if not size:
        size = "1024x1024"
    
    # Validate size for model
    if model == "dall-e-2" and size not in ["256x256", "512x512", "1024x1024"]:
        return json.dumps({
            "error": "Invalid size for DALL-E 2",
            "valid_sizes": ["256x256", "512x512", "1024x1024"]
        }, indent=2)
    elif model == "dall-e-3" and size not in ["1024x1024", "1792x1024", "1024x1792"]:
        return json.dumps({
            "error": "Invalid size for DALL-E 3",
            "valid_sizes": ["1024x1024", "1792x1024", "1024x1792"]
        }, indent=2)
    
    try:
        # Build parameters
        params = {
            "model": model,
            "prompt": prompt[:1000] if model == "dall-e-2" else prompt[:4000],
            "size": size,
            "n": 1,  # DALL-E 3 only supports n=1
            "response_format": response_format
        }
        
        # Add DALL-E 3 specific parameters
        if model == "dall-e-3":
            params["quality"] = quality
            params["style"] = style
        
        # Generate image
        response = await client.images.generate(**params)
        
        # Extract image data
        image_data = response.data[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        result = {
            "model": model,
            "prompt": prompt,
            "size": size,
            "timestamp": timestamp,
            "revised_prompt": getattr(image_data, "revised_prompt", prompt)
        }
        
        if model == "dall-e-3":
            result["quality"] = quality
            result["style"] = style
        
        # Handle response based on format
        if response_format == "url":
            result["url"] = image_data.url
            
            # Download and save locally if requested
            if save_locally:
                filename = generate_filename(prompt, model, timestamp)
                save_path = Path(SAVE_DIR) / filename
                
                success = await download_image(image_data.url, save_path)
                if success:
                    result["local_path"] = str(save_path)
                    result["filename"] = filename
                    
                    # Store metadata
                    IMAGE_METADATA[filename] = {
                        **result,
                        "created_at": datetime.now().isoformat()
                    }
        else:  # b64_json
            result["b64_json"] = image_data.b64_json
            
            # Save locally if requested
            if save_locally:
                filename = generate_filename(prompt, model, timestamp)
                save_path = Path(SAVE_DIR) / filename
                
                success = await save_base64_image(image_data.b64_json, save_path)
                if success:
                    result["local_path"] = str(save_path)
                    result["filename"] = filename
                    
                    # Store metadata
                    IMAGE_METADATA[filename] = {
                        **result,
                        "created_at": datetime.now().isoformat()
                    }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to generate image: {str(e)}",
            "prompt": prompt,
            "model": model
        }, indent=2)


@mcp.tool()
async def list_generated_images(
    limit: int = 20,
    sort_by: Literal["newest", "oldest"] = "newest"
) -> str:
    """
    List previously generated images with their metadata.
    
    Args:
        limit: Maximum number of images to return
        sort_by: Sort order - "newest" or "oldest"
    
    Returns:
        JSON string with list of generated images and metadata
    """
    try:
        # Get all image files in save directory
        save_path = Path(SAVE_DIR)
        if not save_path.exists():
            return json.dumps({
                "count": 0,
                "images": [],
                "message": "No images generated yet"
            }, indent=2)
        
        # Get all PNG files
        image_files = list(save_path.glob("*.png"))
        
        # Sort by modification time
        if sort_by == "newest":
            image_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        else:
            image_files.sort(key=lambda x: x.stat().st_mtime)
        
        # Limit results
        image_files = image_files[:limit]
        
        # Build results
        images = []
        for img_path in image_files:
            img_info = {
                "filename": img_path.name,
                "path": str(img_path),
                "size_bytes": img_path.stat().st_size,
                "modified": datetime.fromtimestamp(img_path.stat().st_mtime).isoformat()
            }
            
            # Add metadata if available
            if img_path.name in IMAGE_METADATA:
                img_info["metadata"] = IMAGE_METADATA[img_path.name]
            
            images.append(img_info)
        
        return json.dumps({
            "count": len(images),
            "total_in_directory": len(list(save_path.glob("*.png"))),
            "images": images
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to list images: {str(e)}"
        }, indent=2)


@mcp.tool()
async def generate_image_variations(
    image_path: str,
    n: int = 1,
    size: Literal["256x256", "512x512", "1024x1024"] = "1024x1024",
    response_format: Literal["url", "b64_json"] = "url",
    save_locally: bool = True
) -> str:
    """
    Generate variations of an existing image (DALL-E 2 only).
    
    Args:
        image_path: Path to the source image (must be PNG, <4MB, and square)
        n: Number of variations to generate (1-10)
        size: Size of the variations
        response_format: Response format - "url" or "b64_json"
        save_locally: Whether to save variations locally
    
    Returns:
        JSON string with variation URLs/data and metadata
    """
    if not client:
        return json.dumps({
            "error": "OpenAI API key not configured",
            "message": "Please set the OPENAI_API_KEY environment variable"
        }, indent=2)
    
    try:
        # Validate image path
        img_path = Path(image_path)
        if not img_path.exists():
            return json.dumps({
                "error": "Image file not found",
                "path": image_path
            }, indent=2)
        
        # Open and validate image
        with Image.open(img_path) as img:
            # Check if square
            if img.width != img.height:
                return json.dumps({
                    "error": "Image must be square",
                    "current_size": f"{img.width}x{img.height}"
                }, indent=2)
            
            # Check file size
            if img_path.stat().st_size > 4 * 1024 * 1024:
                return json.dumps({
                    "error": "Image must be less than 4MB",
                    "current_size_mb": img_path.stat().st_size / (1024 * 1024)
                }, indent=2)
        
        # Read image data
        image_data = img_path.read_bytes()
        
        # Generate variations
        response = await client.images.create_variation(
            image=image_data,
            n=min(n, 10),  # API limit
            size=size,
            response_format=response_format
        )
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        variations = []
        
        for i, image_data in enumerate(response.data):
            variation = {
                "index": i,
                "original_image": image_path,
                "size": size,
                "timestamp": timestamp
            }
            
            if response_format == "url":
                variation["url"] = image_data.url
                
                if save_locally:
                    filename = f"variation_{i}_{timestamp}_{img_path.stem}.png"
                    save_path = Path(SAVE_DIR) / filename
                    
                    success = await download_image(image_data.url, save_path)
                    if success:
                        variation["local_path"] = str(save_path)
                        variation["filename"] = filename
            else:
                variation["b64_json"] = image_data.b64_json
                
                if save_locally:
                    filename = f"variation_{i}_{timestamp}_{img_path.stem}.png"
                    save_path = Path(SAVE_DIR) / filename
                    
                    success = await save_base64_image(image_data.b64_json, save_path)
                    if success:
                        variation["local_path"] = str(save_path)
                        variation["filename"] = filename
            
            variations.append(variation)
        
        return json.dumps({
            "original_image": image_path,
            "count": len(variations),
            "variations": variations
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to generate variations: {str(e)}",
            "image_path": image_path
        }, indent=2)


@mcp.tool()
async def get_image_metadata(filename: str) -> str:
    """
    Get metadata for a previously generated image.
    
    Args:
        filename: Name of the image file
    
    Returns:
        JSON string with image metadata
    """
    if filename in IMAGE_METADATA:
        return json.dumps({
            "filename": filename,
            "metadata": IMAGE_METADATA[filename]
        }, indent=2)
    
    # Check if file exists
    img_path = Path(SAVE_DIR) / filename
    if img_path.exists():
        return json.dumps({
            "filename": filename,
            "path": str(img_path),
            "size_bytes": img_path.stat().st_size,
            "modified": datetime.fromtimestamp(img_path.stat().st_mtime).isoformat(),
            "metadata": "No metadata stored for this image"
        }, indent=2)
    
    return json.dumps({
        "error": "Image not found",
        "filename": filename
    }, indent=2)


@mcp.tool()
async def clear_old_images(days_old: int = 7) -> str:
    """
    Clear images older than specified days.
    
    Args:
        days_old: Delete images older than this many days
    
    Returns:
        JSON string with deletion results
    """
    try:
        save_path = Path(SAVE_DIR)
        if not save_path.exists():
            return json.dumps({
                "message": "No images directory found",
                "deleted_count": 0
            }, indent=2)
        
        # Calculate cutoff time
        cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
        
        deleted_files = []
        errors = []
        
        for img_path in save_path.glob("*.png"):
            try:
                if img_path.stat().st_mtime < cutoff_time:
                    # Remove from metadata if present
                    if img_path.name in IMAGE_METADATA:
                        del IMAGE_METADATA[img_path.name]
                    
                    # Delete file
                    img_path.unlink()
                    deleted_files.append(img_path.name)
            except Exception as e:
                errors.append({
                    "file": img_path.name,
                    "error": str(e)
                })
        
        return json.dumps({
            "deleted_count": len(deleted_files),
            "deleted_files": deleted_files,
            "errors": errors if errors else None,
            "message": f"Deleted {len(deleted_files)} images older than {days_old} days"
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to clear old images: {str(e)}"
        }, indent=2)


if __name__ == "__main__":
    # Check for API key
    if not OPENAI_API_KEY:
        print("Warning: OPENAI_API_KEY not set. Image generation will not work.")
        print("Please set the OPENAI_API_KEY environment variable.")
    
    # Run the FastMCP server
    mcp.run()