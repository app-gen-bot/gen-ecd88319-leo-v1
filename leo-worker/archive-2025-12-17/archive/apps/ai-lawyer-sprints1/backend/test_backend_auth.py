#!/usr/bin/env python3
"""Test backend auth proxy endpoints"""

import asyncio
import httpx

async def test_backend_auth():
    """Test the backend auth proxy"""
    base_url = "http://localhost:8000/api/v1"
    
    async with httpx.AsyncClient() as client:
        print("Testing Backend Auth Proxy Endpoints")
        print("=" * 40)
        
        # 1. Test health check
        try:
            response = await client.get(f"{base_url}/health")
            print(f"1. Health Check: {response.status_code}")
            if response.status_code == 200:
                print(f"   Response: {response.json()}")
        except httpx.ConnectError:
            print("❌ Backend API is not running on port 8000")
            print("   Please run: python simple_server.py")
            return
        
        # 2. Test signup
        print("\n2. Testing Signup via Backend Proxy...")
        signup_data = {
            "email": "demo@example.com",
            "password": "DemoRocks2025!",  # Use the demo password from .env
            "name": "Demo User",
            "city": "New York", 
            "state": "NY"
        }
        
        try:
            response = await client.post(f"{base_url}/auth/signup", json=signup_data)
            print(f"   Status: {response.status_code}")
            if response.status_code == 503:
                print("   ⚠️  Better Auth server is not running!")
                print("   Please run: npm run auth:dev")
            elif response.status_code == 200:
                print(f"   ✅ Signup successful: {response.json()}")
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # 3. Test login
        print("\n3. Testing Login via Backend Proxy...")
        login_data = {
            "email": "demo@example.com",
            "password": "DemoRocks2025!"
        }
        
        try:
            response = await client.post(f"{base_url}/auth/login", json=login_data)
            print(f"   Status: {response.status_code}")
            if response.status_code == 503:
                print("   ⚠️  Better Auth server is not running!")
            elif response.status_code == 200:
                print(f"   ✅ Login successful")
                # Save cookies for session test
                cookies = response.cookies
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # 4. Test session
        print("\n4. Testing Session Check...")
        try:
            response = await client.get(f"{base_url}/auth/session")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("Backend Auth Proxy Test")
    print("=" * 40)
    print("Prerequisites:")
    print("1. Better Auth server running on port 3095 (npm run auth:dev)")
    print("2. Backend API running on port 8000 (python simple_server.py)")
    print("")
    
    asyncio.run(test_backend_auth())