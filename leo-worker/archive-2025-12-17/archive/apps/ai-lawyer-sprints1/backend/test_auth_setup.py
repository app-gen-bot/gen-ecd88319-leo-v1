#!/usr/bin/env python3
"""Test Better Auth setup by creating tables and testing the server"""

import asyncio
import httpx
from db.connection import ensure_tables_exist

async def test_better_auth():
    """Test the Better Auth server"""
    print("1. Creating DynamoDB tables...")
    ensure_tables_exist()
    
    print("\n2. Testing Better Auth server...")
    print("   Make sure Better Auth server is running on port 3095")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test session endpoint (should return invalid session)
            response = await client.get("http://localhost:3095/api/auth/session")
            print(f"   - Session endpoint: {response.status_code}")
            if response.status_code == 200:
                print(f"     Response: {response.json()}")
            
            # Test signup endpoint
            print("\n3. Testing signup...")
            signup_data = {
                "email": "test@example.com",
                "password": "testpass123",
                "name": "Test User"
            }
            response = await client.post(
                "http://localhost:3095/api/auth/signup",
                json=signup_data
            )
            print(f"   - Signup: {response.status_code}")
            if response.status_code == 200:
                print(f"     Response: {response.json()}")
            else:
                print(f"     Error: {response.text}")
                
        except httpx.ConnectError:
            print("   ❌ Could not connect to Better Auth server on port 3095")
            print("   Please run: npm run auth:dev")

if __name__ == "__main__":
    asyncio.run(test_better_auth())