"""
VIP Fan Experience Backend
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.routes import (
    tours_router,
    fans_router,
    consent_router,
    tickets_router,
    admin_router,
)

# Create FastAPI app
app = FastAPI(
    title="VIP Fan Experience API",
    description="Backend API for VIP ticket selection and generation system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def root():
    """Root endpoint - API information"""
    return {
        "message": "VIP Fan Experience API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG
    }


# Include routers
app.include_router(tours_router)
app.include_router(fans_router)
app.include_router(consent_router)
app.include_router(tickets_router)
app.include_router(admin_router)


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Run on application startup
    Initialize database tables (in development)
    """
    print("🚀 Starting VIP Fan Experience API...")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug Mode: {settings.DEBUG}")
    print(f"🗄️  Database: {settings.DATABASE_URL}")
    
    # Create tables (only if using SQLite and in development)
    # In production, use Alembic migrations instead
    if settings.ENVIRONMENT == "development" and settings.DATABASE_URL.startswith("sqlite"):
        print("📦 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
    
    print("✅ Application started successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    print("👋 Shutting down VIP Fan Experience API...")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )