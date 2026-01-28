#!/usr/bin/env python3
"""
Unsplash MCP Server

Provides Unsplash stock photo search and download capabilities for AI agents through the Model Context Protocol.
Uses Unsplash API to search, filter, and properly attribute professional stock photography.
"""

import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Literal
import hashlib
from urllib.parse import urlencode, quote

import httpx
from fastmcp import FastMCP
from PIL import Image
import io

# Initialize FastMCP server
mcp = FastMCP("Unsplash Stock Photo Server", version="1.0.0")

# Environment configuration
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
SAVE_DIR = os.getenv("UNSPLASH_SAVE_DIR", "./stock_photos")
CACHE_DURATION_DAYS = int(os.getenv("UNSPLASH_CACHE_DAYS", "30"))

# Ensure save directory exists
Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)

# API configuration
BASE_URL = "https://api.unsplash.com"
DOWNLOAD_ENDPOINT = "https://api.unsplash.com/photos/{id}/download"

# Image metadata storage (in production, use a proper database)
IMAGE_METADATA: Dict[str, Dict[str, Any]] = {}

# Common UI element to image suggestions mapping
UI_SUGGESTIONS = {
    "hero": ["modern office", "teamwork", "technology", "landscape", "abstract"],
    "background": ["gradient", "abstract", "minimal", "texture", "pattern"],
    "login": ["security", "lock", "shield", "authentication", "key"],
    "dashboard": ["analytics", "charts", "data visualization", "metrics", "graphs"],
    "profile": ["avatar", "person", "user", "portrait", "professional"],
    "settings": ["gears", "configuration", "tools", "preferences", "controls"],
    "error": ["warning", "alert", "caution", "problem", "broken"],
    "success": ["checkmark", "celebration", "achievement", "thumbs up", "victory"],
    "loading": ["hourglass", "spinner", "clock", "progress", "wait"],
    "empty": ["blank", "void", "minimalist", "space", "clean"],
    "header": ["banner", "panoramic", "wide landscape", "horizon", "skyline"],
    "footer": ["foundation", "base", "ground", "bottom", "support"],
    "sidebar": ["navigation", "menu", "list", "vertical", "column"],
    "card": ["frame", "container", "box", "square", "rectangle"],
    "feature": ["highlight", "star", "spotlight", "focus", "important"],
    "testimonial": ["review", "feedback", "quote", "opinion", "rating"],
    "team": ["group", "collaboration", "meeting", "people", "teamwork"],
    "contact": ["communication", "email", "phone", "message", "connect"],
    "about": ["story", "history", "journey", "mission", "values"],
    "product": ["showcase", "display", "item", "merchandise", "goods"],
    "service": ["support", "help", "assistance", "solution", "professional"],
    "blog": ["writing", "article", "notebook", "pen", "keyboard"],
    "gallery": ["collection", "portfolio", "showcase", "exhibition", "display"],
    "pricing": ["money", "cost", "value", "budget", "finance"],
    "faq": ["question", "help", "support", "information", "answer"],
    "404": ["lost", "not found", "missing", "confused", "search"],
    "maintenance": ["construction", "repair", "tools", "work in progress", "fixing"]
}


def generate_filename(query: str, photo_id: str, timestamp: str) -> str:
    """Generate a unique filename based on query and photo ID."""
    # Clean query for filename (first 30 chars, alphanumeric only)
    clean_query = "".join(c for c in query[:30] if c.isalnum() or c.isspace()).strip()
    clean_query = clean_query.replace(" ", "_")[:30]
    
    return f"unsplash_{clean_query}_{photo_id}_{timestamp}.jpg"


async def download_image(url: str, save_path: Path, access_key: str) -> bool:
    """Download image from Unsplash URL and save to disk."""
    try:
        headers = {
            "Authorization": f"Client-ID {access_key}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, follow_redirects=True)
            response.raise_for_status()
            
            # Save image
            save_path.write_bytes(response.content)
            return True
    except Exception as e:
        print(f"Error downloading image: {e}")
        return False


def build_attribution(photo_data: Dict[str, Any]) -> Dict[str, str]:
    """Build proper attribution for an Unsplash photo."""
    photographer_name = photo_data.get("user", {}).get("name", "Unknown")
    photographer_url = photo_data.get("user", {}).get("links", {}).get("html", "")
    photo_url = photo_data.get("links", {}).get("html", "")
    
    return {
        "text": f"Photo by {photographer_name} on Unsplash",
        "html": f'Photo by <a href="{photographer_url}?utm_source=your_app&utm_medium=referral">{photographer_name}</a> on <a href="https://unsplash.com?utm_source=your_app&utm_medium=referral">Unsplash</a>',
        "markdown": f"Photo by [{photographer_name}]({photographer_url}?utm_source=your_app&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=your_app&utm_medium=referral)",
        "photographer_name": photographer_name,
        "photographer_url": photographer_url,
        "photo_url": photo_url
    }


def get_image_urls(photo_data: Dict[str, Any]) -> Dict[str, str]:
    """Extract various size URLs from photo data."""
    urls = photo_data.get("urls", {})
    return {
        "raw": urls.get("raw", ""),  # Original size
        "full": urls.get("full", ""),  # Full size
        "regular": urls.get("regular", ""),  # 1080px width
        "small": urls.get("small", ""),  # 400px width
        "thumb": urls.get("thumb", ""),  # 200px width
        "small_s3": urls.get("small_s3", ""),  # Small S3 hosted
        # Add custom sizes using URL parameters
        "hero_desktop": f"{urls.get('raw', '')}&w=1920&h=1080&fit=crop" if urls.get("raw") else "",
        "hero_mobile": f"{urls.get('raw', '')}&w=768&h=480&fit=crop" if urls.get("raw") else "",
        "card": f"{urls.get('raw', '')}&w=400&h=300&fit=crop" if urls.get("raw") else "",
        "thumbnail": f"{urls.get('raw', '')}&w=150&h=150&fit=crop" if urls.get("raw") else ""
    }


@mcp.tool()
async def search_photos(
    query: str,
    per_page: int = 10,
    page: int = 1,
    orientation: Optional[Literal["landscape", "portrait", "squarish"]] = None,
    color: Optional[Literal["black_and_white", "black", "white", "yellow", "orange", "red", "purple", "magenta", "green", "teal", "blue"]] = None,
    content_filter: Literal["low", "high"] = "high",
    order_by: Literal["relevant", "latest"] = "relevant",
    save_locally: bool = True
) -> str:
    """
    Search for photos on Unsplash based on keywords and filters.
    
    Args:
        query: Search terms (e.g., "modern office", "teamwork", "nature landscape")
        per_page: Number of results per page (max 30)
        page: Page number for pagination
        orientation: Filter by photo orientation
        color: Filter by dominant color
        content_filter: Content safety level - "high" removes content unsuitable for young audiences
        order_by: Sort order for results
        save_locally: Whether to download and cache images locally
    
    Returns:
        JSON string with search results including URLs, attribution, and metadata
    """
    if not UNSPLASH_ACCESS_KEY:
        return json.dumps({
            "error": "Unsplash API key not configured",
            "message": "Please set the UNSPLASH_ACCESS_KEY environment variable"
        }, indent=2)
    
    try:
        # Build search parameters
        params = {
            "query": query,
            "per_page": min(per_page, 30),
            "page": page,
            "order_by": order_by,
            "content_filter": content_filter
        }
        
        if orientation:
            params["orientation"] = orientation
        if color:
            params["color"] = color
        
        # Make API request
        headers = {
            "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
            "Accept-Version": "v1"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/search/photos",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            
            data = response.json()
            
            results = []
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            for photo in data.get("results", []):
                photo_info = {
                    "id": photo.get("id"),
                    "description": photo.get("description") or photo.get("alt_description", ""),
                    "width": photo.get("width"),
                    "height": photo.get("height"),
                    "color": photo.get("color"),
                    "blur_hash": photo.get("blur_hash"),
                    "urls": get_image_urls(photo),
                    "attribution": build_attribution(photo),
                    "likes": photo.get("likes", 0),
                    "tags": [tag.get("title") for tag in photo.get("tags", [])][:5]
                }
                
                # Download and save locally if requested
                if save_locally and photo_info["urls"].get("regular"):
                    filename = generate_filename(query, photo["id"], timestamp)
                    save_path = Path(SAVE_DIR) / filename
                    
                    # Trigger download tracking (required by Unsplash API terms)
                    if photo.get("links", {}).get("download_location"):
                        try:
                            await client.get(
                                photo["links"]["download_location"],
                                headers=headers
                            )
                        except:
                            pass  # Continue even if tracking fails
                    
                    success = await download_image(
                        photo_info["urls"]["regular"],
                        save_path,
                        UNSPLASH_ACCESS_KEY
                    )
                    
                    if success:
                        photo_info["local_path"] = str(save_path)
                        photo_info["filename"] = filename
                        
                        # Store metadata
                        IMAGE_METADATA[filename] = {
                            **photo_info,
                            "query": query,
                            "downloaded_at": datetime.now().isoformat()
                        }
                
                results.append(photo_info)
            
            return json.dumps({
                "query": query,
                "total": data.get("total", 0),
                "total_pages": data.get("total_pages", 0),
                "page": page,
                "per_page": per_page,
                "results": results
            }, indent=2)
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            error_msg = "Invalid API key or unauthorized access"
        elif e.response.status_code == 403:
            error_msg = "Rate limit exceeded. Please wait before making more requests"
        else:
            error_msg = f"API error: {e.response.status_code}"
        
        return json.dumps({
            "error": error_msg,
            "query": query
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "error": f"Failed to search photos: {str(e)}",
            "query": query
        }, indent=2)


@mcp.tool()
async def get_random_photo(
    query: Optional[str] = None,
    orientation: Optional[Literal["landscape", "portrait", "squarish"]] = None,
    content_filter: Literal["low", "high"] = "high",
    featured: bool = True,
    save_locally: bool = True
) -> str:
    """
    Get a random photo from Unsplash, optionally filtered by query and orientation.
    
    Args:
        query: Optional search terms to filter random selection
        orientation: Filter by photo orientation
        content_filter: Content safety level
        featured: Only return photos from featured collections
        save_locally: Whether to download and cache the image
    
    Returns:
        JSON string with photo data, URLs, and attribution
    """
    if not UNSPLASH_ACCESS_KEY:
        return json.dumps({
            "error": "Unsplash API key not configured",
            "message": "Please set the UNSPLASH_ACCESS_KEY environment variable"
        }, indent=2)
    
    try:
        # Build parameters
        params = {
            "content_filter": content_filter
        }
        
        if query:
            params["query"] = query
        if orientation:
            params["orientation"] = orientation
        if featured:
            params["featured"] = "true"
        
        # Make API request
        headers = {
            "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
            "Accept-Version": "v1"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BASE_URL}/photos/random",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            
            photo = response.json()
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            photo_info = {
                "id": photo.get("id"),
                "description": photo.get("description") or photo.get("alt_description", ""),
                "width": photo.get("width"),
                "height": photo.get("height"),
                "color": photo.get("color"),
                "blur_hash": photo.get("blur_hash"),
                "urls": get_image_urls(photo),
                "attribution": build_attribution(photo),
                "likes": photo.get("likes", 0),
                "tags": [tag.get("title") for tag in photo.get("tags", [])][:5]
            }
            
            # Download and save locally if requested
            if save_locally and photo_info["urls"].get("regular"):
                filename = generate_filename(query or "random", photo["id"], timestamp)
                save_path = Path(SAVE_DIR) / filename
                
                # Trigger download tracking
                if photo.get("links", {}).get("download_location"):
                    try:
                        await client.get(
                            photo["links"]["download_location"],
                            headers=headers
                        )
                    except:
                        pass
                
                success = await download_image(
                    photo_info["urls"]["regular"],
                    save_path,
                    UNSPLASH_ACCESS_KEY
                )
                
                if success:
                    photo_info["local_path"] = str(save_path)
                    photo_info["filename"] = filename
                    
                    # Store metadata
                    IMAGE_METADATA[filename] = {
                        **photo_info,
                        "query": query or "random",
                        "downloaded_at": datetime.now().isoformat()
                    }
            
            return json.dumps(photo_info, indent=2)
            
    except Exception as e:
        return json.dumps({
            "error": f"Failed to get random photo: {str(e)}",
            "query": query
        }, indent=2)


@mcp.tool()
async def suggest_image(
    ui_element: str,
    app_type: Optional[str] = None,
    style: Optional[Literal["modern", "minimal", "corporate", "playful", "dark", "light"]] = None,
    count: int = 3
) -> str:
    """
    Get intelligent image suggestions for specific UI elements.
    
    Args:
        ui_element: The UI element needing an image (e.g., "hero", "login", "dashboard", "404")
        app_type: Type of application (e.g., "saas", "ecommerce", "blog", "portfolio")
        style: Visual style preference
        count: Number of suggestions to return
    
    Returns:
        JSON string with suggested search queries and direct image results
    """
    # Get base suggestions for the UI element
    base_suggestions = UI_SUGGESTIONS.get(ui_element.lower(), ["abstract", "modern", "professional"])
    
    # Enhance suggestions based on app type
    if app_type:
        app_modifiers = {
            "saas": ["software", "technology", "cloud", "digital"],
            "ecommerce": ["shopping", "retail", "product", "commerce"],
            "blog": ["writing", "content", "creative", "storytelling"],
            "portfolio": ["creative", "artistic", "design", "showcase"],
            "corporate": ["business", "professional", "office", "executive"],
            "startup": ["innovation", "growth", "team", "modern"],
            "medical": ["healthcare", "medical", "doctor", "hospital"],
            "education": ["learning", "education", "students", "classroom"],
            "finance": ["finance", "money", "investment", "banking"],
            "travel": ["travel", "destination", "adventure", "explore"]
        }
        modifiers = app_modifiers.get(app_type.lower(), [])
        if modifiers:
            base_suggestions = [f"{modifier} {base}" for modifier in modifiers[:2] for base in base_suggestions[:2]]
    
    # Apply style preferences
    if style:
        style_modifiers = {
            "modern": "modern contemporary",
            "minimal": "minimal simple clean",
            "corporate": "professional business formal",
            "playful": "colorful fun vibrant",
            "dark": "dark moody dramatic",
            "light": "bright light airy"
        }
        style_prefix = style_modifiers.get(style.lower(), "")
        if style_prefix:
            base_suggestions = [f"{style_prefix} {suggestion}" for suggestion in base_suggestions]
    
    # Get the top suggestions
    suggestions = base_suggestions[:count]
    
    # Search for actual images using the first suggestion
    primary_query = suggestions[0] if suggestions else "abstract background"
    search_result = await search_photos(
        query=primary_query,
        per_page=count,
        orientation="landscape" if ui_element.lower() in ["hero", "header", "banner"] else None,
        content_filter="high",
        save_locally=True
    )
    
    try:
        search_data = json.loads(search_result)
        images = search_data.get("results", [])
    except:
        images = []
    
    return json.dumps({
        "ui_element": ui_element,
        "app_type": app_type,
        "style": style,
        "suggested_queries": suggestions,
        "recommended_images": images,
        "usage_tips": {
            "hero": "Use landscape orientation, high resolution, with space for text overlay",
            "background": "Choose subtle, non-distracting images or patterns",
            "card": "Square or slightly rectangular images work best",
            "profile": "Consider using abstract avatars or professional portraits",
            "error": "Use friendly, helpful imagery to soften error messages"
        }.get(ui_element.lower(), "Choose images that complement your content without overwhelming it")
    }, indent=2)


@mcp.tool()
async def generate_attribution(
    photo_id: Optional[str] = None,
    filename: Optional[str] = None,
    format: Literal["html", "markdown", "text", "react"] = "html"
) -> str:
    """
    Generate proper attribution for an Unsplash photo.
    
    Args:
        photo_id: Unsplash photo ID
        filename: Local filename if photo was downloaded
        format: Output format for attribution
    
    Returns:
        JSON string with formatted attribution
    """
    if not photo_id and not filename:
        return json.dumps({
            "error": "Either photo_id or filename must be provided"
        }, indent=2)
    
    # Get photo metadata
    photo_data = None
    if filename and filename in IMAGE_METADATA:
        photo_data = IMAGE_METADATA[filename]
    elif photo_id:
        # Would need to fetch from API if not in cache
        # For now, return a template
        return json.dumps({
            "format": format,
            "attribution": {
                "text": f"Photo on Unsplash",
                "html": f'Photo on <a href="https://unsplash.com?utm_source=your_app&utm_medium=referral">Unsplash</a>',
                "markdown": f"Photo on [Unsplash](https://unsplash.com?utm_source=your_app&utm_medium=referral)",
                "react": f'<span>Photo on <a href="https://unsplash.com?utm_source=your_app&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></span>'
            }[format],
            "note": "Full attribution requires photo metadata. Use search_photos or get_random_photo first."
        }, indent=2)
    
    if not photo_data or "attribution" not in photo_data:
        return json.dumps({
            "error": "Photo metadata not found in cache"
        }, indent=2)
    
    attribution = photo_data["attribution"]
    
    formatted = {
        "text": attribution["text"],
        "html": attribution["html"],
        "markdown": attribution["markdown"],
        "react": f'<span>{attribution["html"].replace("<a ", "<a target=\"_blank\" rel=\"noopener noreferrer\" ")}</span>'
    }
    
    return json.dumps({
        "format": format,
        "attribution": formatted[format],
        "photographer": attribution["photographer_name"],
        "photo_url": attribution["photo_url"],
        "guidelines": "Always display attribution when using Unsplash photos as per API terms"
    }, indent=2)


@mcp.tool()
async def list_cached_images(
    limit: int = 20,
    sort_by: Literal["newest", "oldest", "most_liked"] = "newest"
) -> str:
    """
    List previously downloaded Unsplash images with their metadata.
    
    Args:
        limit: Maximum number of images to return
        sort_by: Sort order for results
    
    Returns:
        JSON string with cached images and metadata
    """
    try:
        save_path = Path(SAVE_DIR)
        if not save_path.exists():
            return json.dumps({
                "count": 0,
                "images": [],
                "message": "No cached images found"
            }, indent=2)
        
        # Get all image files
        image_files = list(save_path.glob("unsplash_*.jpg"))
        
        # Build results with metadata
        images = []
        for img_path in image_files:
            if img_path.name in IMAGE_METADATA:
                metadata = IMAGE_METADATA[img_path.name]
                images.append({
                    "filename": img_path.name,
                    "path": str(img_path),
                    "query": metadata.get("query", ""),
                    "description": metadata.get("description", ""),
                    "id": metadata.get("id", ""),
                    "likes": metadata.get("likes", 0),
                    "downloaded_at": metadata.get("downloaded_at", ""),
                    "attribution": metadata.get("attribution", {}),
                    "urls": metadata.get("urls", {}),
                    "tags": metadata.get("tags", [])
                })
        
        # Sort results
        if sort_by == "newest":
            images.sort(key=lambda x: x.get("downloaded_at", ""), reverse=True)
        elif sort_by == "oldest":
            images.sort(key=lambda x: x.get("downloaded_at", ""))
        elif sort_by == "most_liked":
            images.sort(key=lambda x: x.get("likes", 0), reverse=True)
        
        # Limit results
        images = images[:limit]
        
        return json.dumps({
            "count": len(images),
            "total_cached": len(image_files),
            "images": images
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to list cached images: {str(e)}"
        }, indent=2)


@mcp.tool()
async def clear_old_cache(days_old: int = 30) -> str:
    """
    Clear cached images older than specified days.
    
    Args:
        days_old: Delete images older than this many days
    
    Returns:
        JSON string with deletion results
    """
    try:
        save_path = Path(SAVE_DIR)
        if not save_path.exists():
            return json.dumps({
                "message": "No cache directory found",
                "deleted_count": 0
            }, indent=2)
        
        cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
        
        deleted_files = []
        errors = []
        
        for img_path in save_path.glob("unsplash_*.jpg"):
            try:
                if img_path.stat().st_mtime < cutoff_time:
                    # Remove from metadata
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
            "message": f"Deleted {len(deleted_files)} cached images older than {days_old} days"
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": f"Failed to clear cache: {str(e)}"
        }, indent=2)


if __name__ == "__main__":
    # Check for API key
    if not UNSPLASH_ACCESS_KEY:
        print("Warning: UNSPLASH_ACCESS_KEY not set. Image search will not work.")
        print("Please set the UNSPLASH_ACCESS_KEY environment variable.")
        print("\nTo get an API key:")
        print("1. Create an account at https://unsplash.com/developers")
        print("2. Create a new application")
        print("3. Copy your Access Key")
        print("4. Set UNSPLASH_ACCESS_KEY environment variable")
    
    # Run the FastMCP server
    mcp.run()