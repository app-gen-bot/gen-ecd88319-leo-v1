"""
Main FastAPI application
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import settings
from db.connection import ensure_tables_exist
from services.user_service import UserService
from api import auth, users, chat, conversations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for the application"""
    # Startup
    print("Starting up AI Lawyer Backend...")
    
    # Ensure DynamoDB tables exist
    ensure_tables_exist()
    
    # Create demo user
    user_service = UserService()
    await user_service.create_demo_user()
    
    # Seed demo data
    from seed_demo_data import seed_demo_data
    await seed_demo_data()
    
    yield
    
    # Shutdown
    print("Shutting down AI Lawyer Backend...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred"
        }
    )


# Health check
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": asyncio.get_event_loop().time()
    }


# Include routers
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)
app.include_router(conversations.router, prefix=settings.api_prefix)

# NextAuth handles authentication on the frontend
# Backend only needs to validate JWT tokens


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Tenant Rights Advisor API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True
    )