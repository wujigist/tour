"""
Admin API Routes
Admin endpoints for managing tours and system
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.tour import Tour
from app.models.fan import Fan
from app.models.fan_selection import FanSelection
from app.schemas.tour import TourCreate, TourUpdate, TourResponse

router = APIRouter(prefix="/api/janjan/001/admin", tags=["Admin"])


# Simple authentication - In production, use proper auth
ADMIN_KEY = "admin-secret-key-change-in-production"


def verify_admin(admin_key: str = None):
    """Simple admin verification - replace with proper auth in production"""
    if admin_key != ADMIN_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    return True


@router.get("/tours", response_model=List[TourResponse])
def get_all_tours_admin(
    admin_key: str,
    db: Session = Depends(get_db)
):
    """Get all tours including inactive (Admin only)"""
    verify_admin(admin_key)
    
    tours = db.query(Tour).order_by(Tour.date).all()
    return tours


@router.post("/tours", response_model=TourResponse, status_code=status.HTTP_201_CREATED)
def create_tour_admin(
    tour_data: TourCreate,
    admin_key: str,
    db: Session = Depends(get_db)
):
    """Create a new tour (Admin only)"""
    verify_admin(admin_key)
    
    tour = Tour(
        title=tour_data.title,
        date=tour_data.date,
        city=tour_data.city,
        venue=tour_data.venue,
        artists=tour_data.artists,
        ticket_limit=tour_data.ticket_limit,
        description=tour_data.description,
        image_url=tour_data.image_url,
        is_active=tour_data.is_active,
    )
    
    db.add(tour)
    db.commit()
    db.refresh(tour)
    
    return tour


@router.put("/tours/{tour_id}", response_model=TourResponse)
def update_tour_admin(
    tour_id: int,
    tour_data: TourUpdate,
    admin_key: str,
    db: Session = Depends(get_db)
):
    """Update a tour (Admin only)"""
    verify_admin(admin_key)
    
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    # Update only provided fields
    update_data = tour_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tour, field, value)
    
    db.commit()
    db.refresh(tour)
    
    return tour


@router.delete("/tours/{tour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tour_admin(
    tour_id: int,
    admin_key: str,
    db: Session = Depends(get_db)
):
    """Delete a tour (Admin only)"""
    verify_admin(admin_key)
    
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    db.delete(tour)
    db.commit()
    
    return None


@router.get("/stats")
def get_admin_stats(
    admin_key: str,
    db: Session = Depends(get_db)
):
    """Get admin statistics"""
    verify_admin(admin_key)
    
    total_tours = db.query(Tour).count()
    active_tours = db.query(Tour).filter(Tour.is_active == True).count()
    total_fans = db.query(Fan).count()
    total_selections = db.query(FanSelection).count()
    
    return {
        "total_tours": total_tours,
        "active_tours": active_tours,
        "total_fans": total_fans,
        "total_selections": total_selections,
    }