"""
Schemas package initialization
Import all schemas in the correct order to avoid circular imports
"""

# Import base schemas first (no dependencies)
from app.schemas.tour import (
    TourBase,
    TourCreate,
    TourUpdate,
    TourResponse,
    TourListResponse,
    TourSummary
)

from app.schemas.fan import (
    FanBase,
    FanCreate,
    FanUpdate,
    FanResponse,
    FanRegistrationResponse
)

from app.schemas.consent import (
    ConsentBase,
    ConsentCreate,
    ConsentUpdate,
    ConsentResponse,
    ConsentSubmitResponse,
    ConsentWithPhotoUpload
)

from app.schemas.selection import (
    SelectionStatusEnum,
    SelectionBase,
    SelectionCreate,
    SelectionBulkCreate,
    SelectionStatusUpdate,
    SelectionResponse,
    SelectionListResponse,
    TicketResponse
)

# Import schemas with relationships AFTER all base schemas
from app.schemas.selection import (
    SelectionWithTour,
    SelectionWithFan
)

from app.schemas.fan import (
    FanWithSelections
)

# Now rebuild all models with forward references
SelectionWithTour.model_rebuild()
SelectionWithFan.model_rebuild()
FanWithSelections.model_rebuild()


__all__ = [
    # Tour schemas
    "TourBase",
    "TourCreate",
    "TourUpdate",
    "TourResponse",
    "TourListResponse",
    "TourSummary",
    
    # Fan schemas
    "FanBase",
    "FanCreate",
    "FanUpdate",
    "FanResponse",
    "FanWithSelections",
    "FanRegistrationResponse",
    
    # Selection schemas
    "SelectionStatusEnum",
    "SelectionBase",
    "SelectionCreate",
    "SelectionBulkCreate",
    "SelectionStatusUpdate",
    "SelectionResponse",
    "SelectionWithTour",
    "SelectionWithFan",
    "SelectionListResponse",
    "TicketResponse",
    
    # Consent schemas
    "ConsentBase",
    "ConsentCreate",
    "ConsentUpdate",
    "ConsentResponse",
    "ConsentSubmitResponse",
    "ConsentWithPhotoUpload",
]