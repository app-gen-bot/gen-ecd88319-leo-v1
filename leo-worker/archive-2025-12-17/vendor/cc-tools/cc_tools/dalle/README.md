# DALL-E MCP Server

An MCP (Model Context Protocol) server that provides DALL-E image generation capabilities to AI agents.

## Features

- **Image Generation**: Generate high-quality images using DALL-E 2 or DALL-E 3
- **Image Variations**: Create variations of existing images (DALL-E 2 only)
- **Local Storage**: Automatically saves generated images locally
- **Metadata Tracking**: Tracks prompts, timestamps, and generation parameters
- **Image Management**: List and manage previously generated images

## Installation

The server requires the following Python packages:
- `fastmcp` - MCP framework
- `openai` - OpenAI API client
- `httpx` - Async HTTP client
- `pillow` - Image processing

## Configuration

Set the following environment variables:

```bash
# Required
export OPENAI_API_KEY="your-openai-api-key"

# Optional (defaults to ./generated_images)
export DALLE_SAVE_DIR="/path/to/save/images"
```

## Running the Server

```bash
python -m cc_tools.dalle.server
```

Or with uv:
```bash
uv run python -m cc_tools.dalle.server
```

## Available Tools

### generate_image
Generate an image from a text prompt.

Parameters:
- `prompt` (required): Text description of the desired image
- `model`: "dall-e-2" or "dall-e-3" (default: "dall-e-3")
- `size`: Image dimensions (model-specific)
- `quality`: "standard" or "hd" (DALL-E 3 only)
- `style`: "vivid" or "natural" (DALL-E 3 only)
- `save_locally`: Whether to save the image locally (default: true)

### generate_image_variations
Create variations of an existing image (DALL-E 2 only).

Parameters:
- `image_path` (required): Path to the source image
- `n`: Number of variations (1-10)
- `size`: Size of variations
- `save_locally`: Whether to save variations locally

### list_generated_images
List previously generated images with metadata.

Parameters:
- `limit`: Maximum number of images to return
- `sort_by`: "newest" or "oldest"

### get_image_metadata
Get metadata for a specific generated image.

Parameters:
- `filename` (required): Name of the image file

### clear_old_images
Delete images older than specified days.

Parameters:
- `days_old`: Delete images older than this many days (default: 7)

## Integration with AI Agents

This server is designed to work with AI agents that support MCP. Configure your agent to use this server by adding it to the MCP configuration:

```python
"dalle": {
    "command": "uv",
    "args": ["run", "python", "-m", "cc_tools.dalle.server"],
    "env": {
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "DALLE_SAVE_DIR": "./generated_images"
    }
}
```

## Image Size Options

### DALL-E 2
- 256x256
- 512x512
- 1024x1024

### DALL-E 3
- 1024x1024 (square)
- 1792x1024 (landscape)
- 1024x1792 (portrait)

## Notes

- DALL-E 3 only supports generating one image at a time (n=1)
- DALL-E 3 provides revised prompts for better results
- Image editing is only available in DALL-E 2
- All images are saved as PNG files
- Source images for variations must be square, PNG, and <4MB