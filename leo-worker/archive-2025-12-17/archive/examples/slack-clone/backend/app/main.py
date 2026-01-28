"""
Slack Clone Backend - Main Application
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.v1 import router as api_router
from app.core.config import settings
from app.core.logging import setup_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    """
    # Startup
    setup_logging()
    # NOTE: Table creation removed - tables should be created via AWS CDK
    # The backend assumes DynamoDB tables already exist
    logger.info("Starting Slack Clone Backend - tables should be provisioned via CDK")
    yield
    # Shutdown
    # Add any cleanup code here


app = FastAPI(
    title=settings.APP_NAME,
    description="A Slack clone built with FastAPI and DynamoDB",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,  # Disable automatic trailing slash redirects
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Slack Clone API",
        "docs": "/docs",
        "health": "/health"
    }