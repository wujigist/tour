"""
Application Configuration
Loads and validates environment variables
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email Configuration
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@viptickets.com"
    MAIL_FROM_NAME: str = "VIP Tickets"
    
    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    TICKET_DIR: str = "./tickets/generated"
    MAX_UPLOAD_SIZE: int = 5242880  # 5MB
    
    # Ticket Settings
    TICKET_EXPIRY_DAYS: int = 90
    MAX_TOURS_PER_FAN: int = 5
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Development
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    def ensure_directories(self):
        """Create necessary directories if they don't exist"""
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)
        os.makedirs(self.TICKET_DIR, exist_ok=True)
        # Create .gitkeep files
        open(os.path.join(self.UPLOAD_DIR, '.gitkeep'), 'a').close()
        open(os.path.join(self.TICKET_DIR, '.gitkeep'), 'a').close()


# Create settings instance
settings = Settings()

# Ensure directories exist on startup
settings.ensure_directories()