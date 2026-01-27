"""
Fans API Routes
Endpoints for fan registration and management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.fan import Fan
from app.models.fan_selection import FanSelection
from app.schemas.fan import (
    FanCreate,
    FanUpdate,
    FanResponse,
    FanWithSelections,
    FanRegistrationResponse,
)
from app.schemas.selection import SelectionCreate, SelectionBulkCreate, SelectionWithTour
from app.utils.validators import generate_registration_code
from app.config import settings

router = APIRouter(prefix="/api/fans", tags=["Fans"])


@router.post("/register", response_model=FanRegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_fan(fan_data: FanCreate, db: Session = Depends(get_db)):
    """
    Register a new fan
    
    Args:
        fan_data: Fan registration data
        db: Database session
        
    Returns:
        FanRegistrationResponse: Registered fan with registration code
        
    Raises:
        HTTPException: 400 if email already registered
    """
    # Check if email already exists
    existing_fan = db.query(Fan).filter(Fan.email == fan_data.email).first()
    if existing_fan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate unique registration code
    registration_code = generate_registration_code()
    while db.query(Fan).filter(Fan.registration_code == registration_code).first():
        registration_code = generate_registration_code()
    
    # Create fan
    fan = Fan(
        email=fan_data.email,
        name=fan_data.name,
        phone=fan_data.phone,
        registration_code=registration_code,
        is_verified=False,  # Can implement email verification later
    )
    
    db.add(fan)
    db.commit()
    db.refresh(fan)
    
    return FanRegistrationResponse(
        fan=FanResponse.from_orm(fan),
        message="Registration successful! Please select your tours.",
        registration_code=registration_code
    )


@router.get("/{fan_id}", response_model=FanWithSelections)
def get_fan(fan_id: int, db: Session = Depends(get_db)):
    """
    Get fan details with their selections
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        FanWithSelections: Fan details including selections
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    return FanWithSelections.from_orm(fan)


@router.get("/email/{email}", response_model=FanResponse)
def get_fan_by_email(email: str, db: Session = Depends(get_db)):
    """
    Get fan by email address
    
    Args:
        email: Fan email
        db: Database session
        
    Returns:
        FanResponse: Fan details
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.email == email).first()
    
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    return FanResponse.from_orm(fan)


@router.get("/code/{registration_code}", response_model=FanResponse)
def get_fan_by_code(registration_code: str, db: Session = Depends(get_db)):
    """
    Get fan by registration code
    
    Args:
        registration_code: Fan registration code
        db: Database session
        
    Returns:
        FanResponse: Fan details
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.registration_code == registration_code).first()
    
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid registration code"
        )
    
    return FanResponse.from_orm(fan)


@router.put("/{fan_id}", response_model=FanResponse)
def update_fan(
    fan_id: int,
    fan_data: FanUpdate,
    db: Session = Depends(get_db)
):
    """
    Update fan information
    
    Args:
        fan_id: Fan ID
        fan_data: Fan update data
        db: Database session
        
    Returns:
        FanResponse: Updated fan
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Update only provided fields
    update_data = fan_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fan, field, value)
    
    db.commit()
    db.refresh(fan)
    
    return FanResponse.from_orm(fan)


@router.post("/{fan_id}/selections", response_model=SelectionWithTour, status_code=status.HTTP_201_CREATED)
def add_tour_selection(
    fan_id: int,
    selection_data: SelectionCreate,
    db: Session = Depends(get_db)
):
    """
    Add a tour selection for a fan
    
    Args:
        fan_id: Fan ID
        selection_data: Selection data
        db: Database session
        
    Returns:
        SelectionWithTour: Created selection with tour details
        
    Raises:
        HTTPException: 400 if max selections reached or tour unavailable
        HTTPException: 404 if fan or tour not found
    """
    from app.models.tour import Tour
    
    # Get fan
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Check max selections
    if not fan.can_select_more_tours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {settings.MAX_TOURS_PER_FAN} tours already selected"
        )
    
    # Get tour
    tour = db.query(Tour).filter(Tour.id == selection_data.tour_id).first()
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour not found"
        )
    
    # Check if tour is available
    if not tour.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tour is not available for selection"
        )
    
    # Check if already selected
    existing = db.query(FanSelection).filter(
        FanSelection.fan_id == fan_id,
        FanSelection.tour_id == selection_data.tour_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tour already selected"
        )
    
    # Create selection
    selection = FanSelection(
        fan_id=fan_id,
        tour_id=selection_data.tour_id
    )
    
    db.add(selection)
    db.commit()
    db.refresh(selection)
    
    return SelectionWithTour.from_orm(selection)


@router.post("/{fan_id}/selections/bulk", response_model=List[SelectionWithTour], status_code=status.HTTP_201_CREATED)
def add_bulk_tour_selections(
    fan_id: int,
    selection_data: SelectionBulkCreate,
    db: Session = Depends(get_db)
):
    """
    Add multiple tour selections at once (max 5 total)
    
    Args:
        fan_id: Fan ID
        selection_data: Bulk selection data
        db: Database session
        
    Returns:
        List[SelectionWithTour]: Created selections with tour details
        
    Raises:
        HTTPException: 400 if validation fails
        HTTPException: 404 if fan not found
    """
    from app.models.tour import Tour
    
    # Get fan
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Check total selections won't exceed max
    current_count = fan.selections_count
    new_count = len(selection_data.tour_ids)
    total = current_count + new_count
    
    if total > settings.MAX_TOURS_PER_FAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot select {new_count} tours. You have {current_count} selections. Maximum is {settings.MAX_TOURS_PER_FAN}."
        )
    
    # Get all tours
    tours = db.query(Tour).filter(Tour.id.in_(selection_data.tour_ids)).all()
    
    if len(tours) != len(selection_data.tour_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tours not found"
        )
    
    # Check all tours are available
    unavailable_tours = [tour.title for tour in tours if not tour.is_available]
    if unavailable_tours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tours not available: {', '.join(unavailable_tours)}"
        )
    
    # Check for duplicates
    existing_tour_ids = [s.tour_id for s in fan.selections]
    duplicates = set(selection_data.tour_ids) & set(existing_tour_ids)
    if duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tours already selected: {duplicates}"
        )
    
    # Create selections
    selections = []
    for tour_id in selection_data.tour_ids:
        selection = FanSelection(
            fan_id=fan_id,
            tour_id=tour_id
        )
        db.add(selection)
        selections.append(selection)
    
    db.commit()
    
    # Refresh all selections
    for selection in selections:
        db.refresh(selection)
    
    return [SelectionWithTour.from_orm(s) for s in selections]


@router.get("/{fan_id}/selections", response_model=List[SelectionWithTour])
def get_fan_selections(fan_id: int, db: Session = Depends(get_db)):
    """
    Get all tour selections for a fan
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        List[SelectionWithTour]: List of selections with tour details
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    return [SelectionWithTour.from_orm(s) for s in fan.selections]


@router.delete("/{fan_id}/selections/{selection_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tour_selection(
    fan_id: int,
    selection_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove a tour selection
    
    Args:
        fan_id: Fan ID
        selection_id: Selection ID
        db: Database session
        
    Raises:
        HTTPException: 404 if selection not found or doesn't belong to fan
        HTTPException: 400 if ticket already generated
    """
    selection = db.query(FanSelection).filter(
        FanSelection.id == selection_id,
        FanSelection.fan_id == fan_id
    ).first()
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selection not found"
        )
    
    # Don't allow deletion if ticket already generated
    if selection.has_ticket:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove selection - ticket already generated"
        )
    
    db.delete(selection)
    db.commit()
    
    return None