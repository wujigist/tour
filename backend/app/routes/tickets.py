"""
Tickets API Routes
Endpoints for ticket generation and download
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db
from app.models.fan import Fan
from app.models.fan_selection import FanSelection
from app.schemas.selection import TicketResponse
from app.services.ticket_generator import ticket_generator

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post("/generate/{fan_id}")
def generate_tickets_for_fan(fan_id: int, db: Session = Depends(get_db)):
    """
    Generate tickets for all of a fan's selections
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        dict: Generation results with ticket information
        
    Raises:
        HTTPException: 404 if fan not found
        HTTPException: 400 if consent not completed
    """
    # Get fan
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Check if consent completed
    if not fan.has_completed_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent form must be completed before generating tickets"
        )
    
    # Check if fan has selections
    if fan.selections_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No tour selections found. Please select tours first."
        )
    
    # Generate tickets
    try:
        tickets = ticket_generator.generate_tickets_for_fan(db, fan)
        
        return {
            "fan_id": fan_id,
            "fan_name": fan.name,
            "tickets_generated": len(tickets),
            "tickets": tickets,
            "message": f"Successfully generated {len(tickets)} ticket(s)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating tickets: {str(e)}"
        )


@router.post("/generate/{fan_id}/selection/{selection_id}")
def generate_single_ticket(
    fan_id: int,
    selection_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate ticket for a specific selection
    
    Args:
        fan_id: Fan ID
        selection_id: Selection ID
        db: Database session
        
    Returns:
        dict: Ticket information
        
    Raises:
        HTTPException: 404 if fan or selection not found
        HTTPException: 400 if consent not completed
    """
    # Get fan
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    # Check if consent completed
    if not fan.has_completed_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent form must be completed before generating tickets"
        )
    
    # Get selection
    selection = db.query(FanSelection).filter(
        FanSelection.id == selection_id,
        FanSelection.fan_id == fan_id
    ).first()
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selection not found"
        )
    
    # Check if ticket already exists
    if selection.has_ticket:
        return {
            "ticket_id": selection.ticket_id,
            "pdf_path": selection.ticket_pdf_path,
            "message": "Ticket already generated",
            "already_generated": True
        }
    
    # Generate ticket
    try:
        tour = selection.tour
        ticket_info = ticket_generator.generate_ticket(db, fan, tour, selection)
        
        return {
            **ticket_info,
            "message": "Ticket generated successfully",
            "already_generated": False
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating ticket: {str(e)}"
        )


@router.get("/download/{ticket_id}")
def download_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """
    Download ticket PDF by ticket ID
    
    Args:
        ticket_id: Ticket ID
        db: Database session
        
    Returns:
        FileResponse: PDF file
        
    Raises:
        HTTPException: 404 if ticket not found
    """
    # Get selection by ticket ID
    selection = db.query(FanSelection).filter(
        FanSelection.ticket_id == ticket_id
    ).first()
    
    if not selection or not selection.ticket_pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if file exists
    if not os.path.exists(selection.ticket_pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket file not found on server"
        )
    
    # Return file
    filename = os.path.basename(selection.ticket_pdf_path)
    return FileResponse(
        path=selection.ticket_pdf_path,
        media_type="application/pdf",
        filename=filename
    )


@router.get("/fan/{fan_id}/downloads")
def get_fan_ticket_downloads(fan_id: int, db: Session = Depends(get_db)):
    """
    Get download information for all of a fan's tickets
    
    Args:
        fan_id: Fan ID
        db: Database session
        
    Returns:
        dict: List of downloadable tickets
        
    Raises:
        HTTPException: 404 if fan not found
    """
    fan = db.query(Fan).filter(Fan.id == fan_id).first()
    if not fan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fan not found"
        )
    
    tickets = []
    for selection in fan.selections:
        if selection.has_ticket:
            tickets.append({
                "ticket_id": selection.ticket_id,
                "tour_title": selection.tour.title,
                "tour_date": selection.tour.date.isoformat(),
                "tour_city": selection.tour.city,
                "download_url": f"/api/tickets/download/{selection.ticket_id}",
                "generated_at": selection.ticket_generated_at.isoformat() if selection.ticket_generated_at else None
            })
    
    return {
        "fan_id": fan_id,
        "fan_name": fan.name,
        "total_tickets": len(tickets),
        "tickets": tickets
    }


@router.get("/verify/{ticket_id}")
def verify_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """
    Verify a ticket by its ID
    
    Args:
        ticket_id: Ticket ID
        db: Database session
        
    Returns:
        dict: Ticket verification information
        
    Raises:
        HTTPException: 404 if ticket not found
    """
    selection = ticket_generator.verify_ticket(ticket_id, db)
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid ticket ID"
        )
    
    return {
        "valid": True,
        "ticket_id": ticket_id,
        "fan_name": selection.fan.name,
        "fan_email": selection.fan.email,
        "tour_title": selection.tour.title,
        "tour_date": selection.tour.date.isoformat(),
        "tour_venue": selection.tour.venue,
        "tour_city": selection.tour.city,
        "status": selection.status.value,
        "generated_at": selection.ticket_generated_at.isoformat() if selection.ticket_generated_at else None
    }


@router.post("/regenerate/{selection_id}")
def regenerate_ticket(selection_id: int, db: Session = Depends(get_db)):
    """
    Regenerate a ticket (e.g., if lost or corrupted)
    
    Args:
        selection_id: Selection ID
        db: Database session
        
    Returns:
        dict: New ticket information
        
    Raises:
        HTTPException: 404 if selection not found
    """
    try:
        ticket_info = ticket_generator.regenerate_ticket(db, selection_id)
        
        return {
            **ticket_info,
            "message": "Ticket regenerated successfully",
            "regenerated": True
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error regenerating ticket: {str(e)}"
        )


@router.get("/selection/{selection_id}/info")
def get_ticket_info(selection_id: int, db: Session = Depends(get_db)):
    """
    Get ticket information for a selection
    
    Args:
        selection_id: Selection ID
        db: Database session
        
    Returns:
        dict: Ticket information
        
    Raises:
        HTTPException: 404 if selection not found
    """
    selection = db.query(FanSelection).filter(
        FanSelection.id == selection_id
    ).first()
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selection not found"
        )
    
    if not selection.has_ticket:
        return {
            "selection_id": selection_id,
            "has_ticket": False,
            "message": "Ticket not yet generated"
        }
    
    return {
        "selection_id": selection_id,
        "has_ticket": True,
        "ticket_id": selection.ticket_id,
        "tour_title": selection.tour.title,
        "tour_date": selection.tour.date.isoformat(),
        "fan_name": selection.fan.name,
        "generated_at": selection.ticket_generated_at.isoformat(),
        "download_url": f"/api/tickets/download/{selection.ticket_id}"
    }