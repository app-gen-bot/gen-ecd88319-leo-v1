#!/usr/bin/env python3
"""Start the Happy Llama Python Agent Server."""

import sys
import os
from pathlib import Path

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
sys.path.insert(0, str(src_path))

# Start the server
if __name__ == "__main__":
    from agent_server.main import app
    import uvicorn
    
    port = int(os.getenv("PORT", "3002"))
    print(f"[AGENT-PYTHON] Starting Happy Llama Python Agent on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")