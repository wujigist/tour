"""
Database Configuration
SQLAlchemy setup and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config import settings

# Create database engine
# SQLite: Add check_same_thread=False for SQLite compatibility
# PostgreSQL: Use pool settings for production
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # PostgreSQL connection
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,  # Reduced for free tier
        max_overflow=10,  # Reduced for free tier
        echo=settings.DEBUG,
        connect_args={
            "connect_timeout": 10,
            "options": "-c timezone=utc"
        }
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency
    
    Usage in FastAPI routes:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            ...
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database
    Creates all tables defined in models
    
    Note: In production, use Alembic migrations instead
    """
    Base.metadata.create_all(bind=engine)


def drop_db():
    """
    Drop all database tables
    WARNING: Use only in development/testing
    """
    Base.metadata.drop_all(bind=engine)