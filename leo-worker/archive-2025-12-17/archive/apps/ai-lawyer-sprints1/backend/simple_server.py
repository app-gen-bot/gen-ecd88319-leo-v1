#!/usr/bin/env python
"""Simple server startup script that sets environment properly"""

import os

# Set environment variables that cause issues
os.environ['ALLOWED_ORIGINS'] = '["http://localhost:3000", "http://localhost:3001", "http://localhost:3095"]'
os.environ['SUPPORTED_FILE_TYPES'] = '[".pdf", ".png", ".jpg", ".jpeg", ".docx", ".txt"]'

# Import and run the main app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )