#!/usr/bin/env python3
"""Create demo user in Better Auth table"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../../../.env')

async def create_demo_user_in_better_auth():
    """Create the demo user via Better Auth API"""
    
    # Check if Better Auth server is running
    better_auth_url = os.getenv("BETTER_AUTH_URL", "http://localhost:3095")
    backend_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("Creating demo user in Better Auth...")
        
        # First check if Better Auth is running
        try:
            response = await client.get(f"{better_auth_url}/api/auth/session")
            print(f"✓ Better Auth server is running on port 3095")
        except httpx.ConnectError:
            print("❌ Better Auth server is not running!")
            print("Please run: npm run auth:dev")
            return
        
        # Check if backend is running
        try:
            response = await client.get(f"{backend_url}/api/v1/health")
            print(f"✓ Backend API is running on port 8000")
        except httpx.ConnectError:
            print("❌ Backend API is not running!")
            print("Please run: python simple_server.py")
            return
        
        # Try to create demo user via backend API (which proxies to Better Auth)
        demo_email = os.getenv("DEMO_USER_EMAIL", "demo@example.com")
        demo_password = os.getenv("DEMO_USER_PASSWORD", "DemoRocks2025!")
        
        print(f"\nCreating demo user: {demo_email}")
        
        try:
            # First try to login to see if user exists
            response = await client.post(
                f"{backend_url}/api/v1/auth/login",
                json={
                    "email": demo_email,
                    "password": demo_password
                }
            )
            
            if response.status_code == 200:
                print("✓ Demo user already exists and can login!")
                return
            else:
                print(f"Demo user exists but login failed: {response.status_code}")
                print("Attempting to create user...")
        except Exception as e:
            print(f"Login check failed: {e}")
        
        # Try to create the user
        try:
            response = await client.post(
                f"{backend_url}/api/v1/auth/signup",
                json={
                    "email": demo_email,
                    "password": demo_password,
                    "name": "Demo User",
                    "city": "San Francisco",
                    "state": "CA"
                }
            )
            
            if response.status_code == 200:
                print("✓ Demo user created successfully!")
                
                # Now try to login
                response = await client.post(
                    f"{backend_url}/api/v1/auth/login",
                    json={
                        "email": demo_email,
                        "password": demo_password
                    }
                )
                
                if response.status_code == 200:
                    print("✓ Demo user can login successfully!")
                else:
                    print(f"❌ Login failed after creation: {response.status_code}")
                    print(f"Response: {response.text}")
            else:
                print(f"❌ Failed to create demo user: {response.status_code}")
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error creating demo user: {e}")

if __name__ == "__main__":
    print("Better Auth Demo User Setup")
    print("==========================")
    print()
    asyncio.run(create_demo_user_in_better_auth())