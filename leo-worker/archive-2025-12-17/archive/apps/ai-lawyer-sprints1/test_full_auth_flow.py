#!/usr/bin/env python3
"""Test the complete authentication flow from frontend to backend to Better Auth"""

import asyncio
import httpx
import json
from datetime import datetime

async def test_full_flow():
    """Test the complete auth flow"""
    print("Complete Authentication Flow Test")
    print("=" * 50)
    print(f"Started at: {datetime.now()}")
    print()
    
    # Test configuration
    frontend_url = "http://localhost:3000"
    backend_url = "http://localhost:8000"
    better_auth_url = "http://localhost:3095"
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # 1. Check all services
        print("1. Checking Service Status")
        print("-" * 30)
        
        # Check frontend
        try:
            response = await client.get(frontend_url)
            print(f"   Frontend (3000): ✅ Running")
        except httpx.ConnectError:
            print(f"   Frontend (3000): ❌ Not running")
            print("   Run: cd frontend && npm run dev")
        
        # Check backend
        try:
            response = await client.get(f"{backend_url}/api/v1/health")
            print(f"   Backend API (8000): ✅ Running")
        except httpx.ConnectError:
            print(f"   Backend API (8000): ❌ Not running")
            print("   Run: cd backend && source venv/bin/activate && python simple_server.py")
            return
        
        # Check Better Auth
        try:
            response = await client.get(f"{better_auth_url}/api/auth/session")
            print(f"   Better Auth (3095): ✅ Running")
        except httpx.ConnectError:
            print(f"   Better Auth (3095): ❌ Not running")
            print("   Run: cd backend && npm run auth:dev")
            return
        
        # 2. Test signup flow
        print("\n2. Testing Signup Flow")
        print("-" * 30)
        
        test_email = f"test_{int(datetime.now().timestamp())}@example.com"
        test_password = "TestPass123!"
        
        print(f"   Creating account: {test_email}")
        
        try:
            response = await client.post(
                f"{backend_url}/api/v1/auth/signup",
                json={
                    "email": test_email,
                    "password": test_password,
                    "name": "Test User",
                    "city": "New York",
                    "state": "NY"
                }
            )
            if response.status_code == 200:
                print(f"   ✅ Signup successful")
                signup_data = response.json()
                print(f"   User ID: {signup_data.get('user', {}).get('id', 'N/A')}")
            else:
                print(f"   ❌ Signup failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return
        except Exception as e:
            print(f"   ❌ Signup error: {e}")
            return
        
        # 3. Test login flow
        print("\n3. Testing Login Flow")
        print("-" * 30)
        
        try:
            response = await client.post(
                f"{backend_url}/api/v1/auth/login",
                json={
                    "email": test_email,
                    "password": test_password
                }
            )
            if response.status_code == 200:
                print(f"   ✅ Login successful")
                login_data = response.json()
                print(f"   Access token: {'Present' if login_data.get('access_token') else 'Missing'}")
                
                # Save cookies for session test
                cookies = response.cookies
            else:
                print(f"   ❌ Login failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return
        except Exception as e:
            print(f"   ❌ Login error: {e}")
            return
        
        # 4. Test session validation
        print("\n4. Testing Session Validation")
        print("-" * 30)
        
        try:
            # Test with cookies
            response = await client.get(
                f"{backend_url}/api/v1/auth/session",
                cookies=cookies
            )
            if response.status_code == 200:
                session_data = response.json()
                if session_data.get('valid'):
                    print(f"   ✅ Session is valid")
                    print(f"   User: {session_data.get('user', {}).get('email', 'N/A')}")
                else:
                    print(f"   ❌ Session is invalid")
            else:
                print(f"   ❌ Session check failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Session error: {e}")
        
        # 5. Test demo user
        print("\n5. Testing Demo User Login")
        print("-" * 30)
        
        try:
            response = await client.post(
                f"{backend_url}/api/v1/auth/login",
                json={
                    "email": "demo@example.com",
                    "password": "DemoRocks2025!"
                }
            )
            if response.status_code == 200:
                print(f"   ✅ Demo login successful")
            else:
                print(f"   ❌ Demo login failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Demo login error: {e}")
        
        # 6. Test logout
        print("\n6. Testing Logout")
        print("-" * 30)
        
        try:
            response = await client.post(
                f"{backend_url}/api/v1/auth/logout",
                cookies=cookies
            )
            if response.status_code == 200:
                print(f"   ✅ Logout successful")
            else:
                print(f"   ❌ Logout failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Logout error: {e}")
    
    print("\n" + "=" * 50)
    print(f"Test completed at: {datetime.now()}")

if __name__ == "__main__":
    print("AI Lawyer - Full Authentication Flow Test")
    print()
    print("This test verifies:")
    print("- All services are running")
    print("- User signup works through the full stack")
    print("- User login works and returns session")
    print("- Session validation works")
    print("- Demo user can login")
    print("- Logout works properly")
    print()
    
    asyncio.run(test_full_flow())