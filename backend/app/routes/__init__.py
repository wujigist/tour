"""
API Routes
Import all route modules
"""

from app.routes.tours import router as tours_router
from app.routes.fans import router as fans_router
from app.routes.consent import router as consent_router
from app.routes.tickets import router as tickets_router
from app.routes.admin import router as admin_router

__all__ = [
    "tours_router",
    "fans_router",
    "consent_router",
    "tickets_router",
    "admin_router",
]