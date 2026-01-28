#!/usr/bin/env python3
"""Verify context awareness setup is working correctly."""

import os
import sys
import json
import asyncio
from pathlib import Path

# Colors for output
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
RED = '\033[0;31m'
BLUE = '\033[0;34m'
NC = '\033[0m'

def print_status(message, status="info"):
    colors = {"info": BLUE, "success": GREEN, "warning": YELLOW, "error": RED}
    print(f"{colors.get(status, NC)}{message}{NC}")

def check_env_vars():
    """Check if required environment variables are set."""
    print_status("\n1. Checking Environment Variables:", "info")
    
    required_vars = {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "cc-core-password",
        "QDRANT_URL": "http://localhost:6333",
        "OPENAI_API_KEY": "sk-proj-*",
    }
    
    all_good = True
    for var, expected in required_vars.items():
        value = os.environ.get(var)
        if value:
            if var == "OPENAI_API_KEY":
                print_status(f"  ✅ {var}: {'*' * 10}{value[-4:]}", "success")
            else:
                print_status(f"  ✅ {var}: {value}", "success")
        else:
            print_status(f"  ❌ {var}: Not set (expected: {expected})", "error")
            all_good = False
    
    return all_good

def check_mcp_config():
    """Check if .mcp.json is properly configured."""
    print_status("\n2. Checking MCP Configuration:", "info")
    
    mcp_file = Path(".mcp.json")
    if not mcp_file.exists():
        print_status("  ❌ .mcp.json not found", "error")
        return False
    
    try:
        with open(mcp_file) as f:
            config = json.load(f)
        
        required_servers = ["mem0", "graphiti", "context_manager", "tree_sitter", "integration_analyzer"]
        configured_servers = list(config.get("mcpServers", {}).keys())
        
        print_status(f"  Found {len(configured_servers)} MCP servers:", "success")
        for server in required_servers:
            if server in configured_servers:
                print_status(f"    ✅ {server}", "success")
            else:
                print_status(f"    ❌ {server} (missing)", "error")
        
        return all(server in configured_servers for server in required_servers)
    
    except Exception as e:
        print_status(f"  ❌ Error reading .mcp.json: {e}", "error")
        return False

def check_services():
    """Check if Docker services are accessible."""
    print_status("\n3. Checking Docker Services:", "info")
    
    import subprocess
    
    # Check Neo4j
    try:
        result = subprocess.run(
            ["curl", "-s", "http://localhost:7474"],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print_status("  ✅ Neo4j is accessible at http://localhost:7474", "success")
        else:
            print_status("  ❌ Neo4j not accessible", "error")
    except:
        print_status("  ❌ Could not check Neo4j", "error")
    
    # Check Qdrant
    try:
        result = subprocess.run(
            ["curl", "-s", "http://localhost:6333/health"],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print_status("  ✅ Qdrant is accessible at http://localhost:6333", "success")
        else:
            print_status("  ❌ Qdrant not accessible", "error")
    except:
        print_status("  ❌ Could not check Qdrant", "error")

def check_python_packages():
    """Check if required Python packages are installed."""
    print_status("\n4. Checking Python Packages:", "info")
    
    try:
        import cc_tools
        print_status("  ✅ cc-tools is installed", "success")
        
        # Check for MCP executables
        mcp_path = Path(".venv/bin/mcp-mem0")
        if mcp_path.exists():
            print_status("  ✅ MCP executables found", "success")
        else:
            print_status("  ❌ MCP executables not found in .venv/bin/", "error")
    
    except ImportError:
        print_status("  ❌ cc-tools not installed", "error")
        return False
    
    return True

def check_agent_config():
    """Check if the orchestrator is properly configured."""
    print_status("\n5. Checking Orchestrator Configuration:", "info")
    
    try:
        from app_factory.agents.stage_0_orchestrator import orchestrator_agent
        print_status("  ✅ Orchestrator agent imported successfully", "success")
        
        # Check if it's context-aware
        if hasattr(orchestrator_agent, 'enable_context_awareness'):
            print_status("  ✅ Orchestrator is context-aware", "success")
        else:
            print_status("  ⚠️  Cannot verify context awareness", "warning")
            
        return True
    
    except Exception as e:
        print_status(f"  ❌ Error importing orchestrator: {e}", "error")
        return False

async def test_basic_functionality():
    """Test basic context awareness functionality."""
    print_status("\n6. Testing Basic Functionality:", "info")
    
    try:
        # Test mem0 connection
        from cc_tools.mem0.client import MemoryClient
        
        config = {
            "qdrant_url": os.environ.get("QDRANT_URL", "http://localhost:6333"),
            "qdrant_collection": "test_collection",
            "user_id": "test_user"
        }
        
        client = MemoryClient(config)
        # Try to add a test memory
        test_memory = await client.add_memory("Test memory for verification", {"test": True})
        if test_memory:
            print_status("  ✅ Successfully connected to mem0", "success")
            # Clean up
            await client.delete_memory(test_memory["id"])
        else:
            print_status("  ❌ Could not add test memory", "error")
            
    except Exception as e:
        print_status(f"  ⚠️  Could not test mem0: {e}", "warning")

def main():
    """Run all verification checks."""
    print_status("🔍 AI App Factory - Context Awareness Verification", "info")
    print("=" * 50)
    
    # Run checks
    env_ok = check_env_vars()
    mcp_ok = check_mcp_config()
    check_services()  # Just informational
    python_ok = check_python_packages()
    agent_ok = check_agent_config()
    
    # Run async test
    asyncio.run(test_basic_functionality())
    
    # Summary
    print_status("\n📊 Summary:", "info")
    print("=" * 50)
    
    if all([env_ok, mcp_ok, python_ok, agent_ok]):
        print_status("✅ All checks passed! Context awareness is ready.", "success")
        print("\nYou can now run:")
        print("  uv run python test_context_aware_orchestrator.py")
    else:
        print_status("❌ Some checks failed. Please fix the issues above.", "error")
        print("\nTroubleshooting:")
        print("1. Run: source setup_context_env.sh")
        print("2. Run: ./manage_services.sh start")
        print("3. Check logs in: logs/")

if __name__ == "__main__":
    main()