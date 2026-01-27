"""
Tours API Routes
Endpoints for managing and retrieving tours
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.tour import Tour
from app.schemas.tour import (
    TourCreate,
    TourUpdate,
    TourResponse,
    TourListResponse,
    TourSummary,
)

router = APIRouter(prefix="/api/tours", tags=["Tours"])


@router.get("/", response_model=TourListResponse)
def get_tours(
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of tours
    
    Args:
        active_only: Only return active tours (default: True)
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        TourListResponse: List of tours with total count
    """
    query = db.query(Tour)
    
    if active_only:
        query = query.filter(Tour.is_active == True)
    
    # Order by date
    query = query.order_by(Tour.date)
    
    total = query.count()
    tours = query.offset(skip).limit(limit).all()
    
    return TourListResponse(
        tours=[TourResponse.from_orm(tour) for tour in tours],
        total=total,
        active_only=active_only
    )


@router.get("/available", response_model=List[TourSummary])
def get_available_tours(db: Session = Depends(get_db)):
    """
    Get all available tours (active and has tickets remaining)
    
    Args:
        db: Database session
        
    Returns:
        List[TourSummary]: List of available tours
    """
    tours = db.query(Tour).filter(
        Tour.is_active == True,
        Tour.tickets_claimed < Tour.ticket_limit
    ).order_by(Tour.date).all()
    
    return [TourSummary.from_orm(tour) for tour in tours]


@router.get("/{tour_id}", response_model=TourResponse)
def get_tour(tour_id: int, db: Session = Depends(get_db)):
    """
    Get a specific tour by ID
    
    Args:
        tour_id: Tour ID
        db: Database session
        
    Returns:
        TourResponse: Tour details
        
    Raises:
        HTTPException: 404 if tour not found
    """
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    return TourResponse.from_orm(tour)


@router.post("/", response_model=TourResponse, status_code=status.HTTP_201_CREATED)
def create_tour(tour_data: TourCreate, db: Session = Depends(get_db)):
    """
    Create a new tour (Admin only in production)
    
    Args:
        tour_data: Tour creation data
        db: Database session
        
    Returns:
        TourResponse: Created tour
    """
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
    
    return TourResponse.from_orm(tour)


@router.put("/{tour_id}", response_model=TourResponse)
def update_tour(
    tour_id: int,
    tour_data: TourUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a tour (Admin only in production)
    
    Args:
        tour_id: Tour ID
        tour_data: Tour update data
        db: Database session
        
    Returns:
        TourResponse: Updated tour
        
    Raises:
        HTTPException: 404 if tour not found
    """
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
    
    return TourResponse.from_orm(tour)


@router.delete("/{tour_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tour(tour_id: int, db: Session = Depends(get_db)):
    """
    Delete a tour (Admin only in production)
    
    Args:
        tour_id: Tour ID
        db: Database session
        
    Raises:
        HTTPException: 404 if tour not found
    """
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    db.delete(tour)
    db.commit()
    
    return None


@router.patch("/{tour_id}/toggle-active", response_model=TourResponse)
def toggle_tour_active(tour_id: int, db: Session = Depends(get_db)):
    """
    Toggle tour active status
    
    Args:
        tour_id: Tour ID
        db: Database session
        
    Returns:
        TourResponse: Updated tour
        
    Raises:
        HTTPException: 404 if tour not found
    """
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    tour.is_active = not tour.is_active
    db.commit()
    db.refresh(tour)
    
    return TourResponse.from_orm(tour)