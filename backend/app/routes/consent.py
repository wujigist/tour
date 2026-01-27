"""
Consent API Routes
Endpoints for consent form submission and management
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import Optional
import os

from app.database import get_db
from app.models.fan import Fan
from app.models.consent import Consent
from app.schemas.consent import (
    ConsentCreate,
    ConsentUpdate,
    ConsentResponse,
    ConsentSubmitResponse,
)
from app.config import settings

router = APIRouter(prefix="/api/consent", tags=["Consent"])


@router.post("/submit", response_model=ConsentSubmitResponse, status_code=status.HTTP_201_CREATED)
def submit_consent(
    consent_data: ConsentCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submit consent form for a fan
    
    Args:
        consent_data: Consent form data
        request: Request object for IP address
        db: Database session
        
    Returns:
        ConsentSubmitResponse: Submitted consent with unlock status
        
    Raises:
        HTTPException: 404 if fan not found
        HTTPException: 400 if consent already submitted
    """
    # Get fan
    fan = db.query(Fan).filter(Fan.id == consent_data.fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Check if consent already exists
    existing_consent = db.query(Consent).filter(Consent.fan_id == consent_data.fan_id).first()
    if existing_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent form already submitted. Use update endpoint to modify."
        )
    
    # Get client IP address
    client_ip = request.client.host if request.client else None
    
    # Create consent
    consent = Consent(
        fan_id=consent_data.fan_id,
        agreed_to_terms=consent_data.agreed_to_terms,
        agreed_to_privacy=consent_data.agreed_to_privacy,
        agreed_to_marketing=consent_data.agreed_to_marketing,
        age_verified=consent_data.age_verified,
        date_of_birth=consent_data.date_of_birth,
        confirmed_name=consent_data.confirmed_name,
        confirmed_email=consent_data.confirmed_email,
        confirmed_phone=consent_data.confirmed_phone,
        signature_name=consent_data.signature_name,
        signature_data=consent_data.signature_data,
        ip_address=client_ip,
    )
    
    # Complete consent (sets agreed=True and signed_at)
    consent.complete_consent(client_ip)
    
    # Unlock tickets
    consent.unlock_tickets()
    
    db.add(consent)
    db.commit()
    db.refresh(consent)
    
    return ConsentSubmitResponse(
        consent=ConsentResponse.from_orm(consent),
        message="Consent submitted successfully! Your tickets are now unlocked.",
        tickets_unlocked=True
    )


@router.get("/{fan_id}", response_model=ConsentResponse)
def get_consent(fan_id: int, db: Session = Depends(get_db)):
    """
    Get consent form for a fan
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        ConsentResponse: Consent details
        
    Raises:
        HTTPException: 404 if consent not found
    """
    consent = db.query(Consent).filter(Consent.fan_id == fan_id).first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent form not found"
        )
    
    return ConsentResponse.from_orm(consent)


@router.put("/{fan_id}", response_model=ConsentResponse)
def update_consent(
    fan_id: int,
    consent_data: ConsentUpdate,
    db: Session = Depends(get_db)
):
    """
    Update consent form (partial updates allowed)
    
    Args:
        fan_id: Fan ID
        consent_data: Consent update data
        db: Database session
        
    Returns:
        ConsentResponse: Updated consent
        
    Raises:
        HTTPException: 404 if consent not found
    """
    consent = db.query(Consent).filter(Consent.fan_id == fan_id).first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent form not found"
        )
    
    # Update only provided fields
    update_data = consent_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(consent, field, value)
    
    db.commit()
    db.refresh(consent)
    
    return ConsentResponse.from_orm(consent)


@router.post("/{fan_id}/upload-photo-id", response_model=ConsentResponse)
async def upload_photo_id(
    fan_id: int,
    photo_id: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload photo ID for consent verification
    
    Args:
        fan_id: Fan ID
        photo_id: Photo ID file (image)
        db: Database session
        
    Returns:
        ConsentResponse: Updated consent with photo_id_uploaded=True
        
    Raises:
        HTTPException: 404 if consent not found
        HTTPException: 400 if file type invalid
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if photo_id.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG and PNG images are allowed."
        )
    
    # Get consent
    consent = db.query(Consent).filter(Consent.fan_id == fan_id).first()
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent form not found. Please submit consent first."
        )
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    from app.utils.validators import sanitize_filename
    original_filename = sanitize_filename(photo_id.filename)
    filename = f"photo_id_{fan_id}_{original_filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Save file
    try:
        contents = await photo_id.read()
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Update consent
    consent.photo_id_path = filepath
    consent.photo_id_uploaded = True
    
    db.commit()
    db.refresh(consent)
    
    return ConsentResponse.from_orm(consent)


@router.get("/{fan_id}/status")
def get_consent_status(fan_id: int, db: Session = Depends(get_db)):
    """
    Get consent completion status for a fan
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        dict: Consent status information
    """
    consent = db.query(Consent).filter(Consent.fan_id == fan_id).first()
    
    if not consent:
        return {
            "fan_id": fan_id,
            "consent_submitted": False,
            "consent_complete": False,
            "tickets_unlocked": False
        }
    
    return {
        "fan_id": fan_id,
        "consent_submitted": True,
        "consent_complete": consent.is_complete,
        "tickets_unlocked": consent.ticket_unlocked,
        "agreed_to_terms": consent.agreed_to_terms,
        "agreed_to_privacy": consent.agreed_to_privacy,
        "age_verified": consent.age_verified,
        "photo_id_uploaded": consent.photo_id_uploaded,
        "signed_at": consent.signed_at.isoformat() if consent.signed_at else None
    }


@router.delete("/{fan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consent(fan_id: int, db: Session = Depends(get_db)):
    """
    Delete consent form (Admin only - for testing)
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Raises:
        HTTPException: 404 if consent not found
    """
    consent = db.query(Consent).filter(Consent.fan_id == fan_id).first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent form not found"
        )
    
    # Delete photo ID file if exists
    if consent.photo_id_path and os.path.exists(consent.photo_id_path):
        try:
            os.remove(consent.photo_id_path)
        except Exception as e:
            print(f"Error deleting photo ID: {e}")
    
    db.delete(consent)
    db.commit()
    
    return None