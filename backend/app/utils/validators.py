"""
Validation Utilities
Helper functions for validation and code generation
"""

import re
import secrets
import string
from datetime import datetime
from typing import Optional


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate phone number format (basic validation)
    Accepts various formats: (123) 456-7890, 123-456-7890, 1234567890
    
    Args:
        phone: Phone number to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not phone or not phone.strip():
        return True  # Optional field
    
    # Remove common formatting characters
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    
    # Check if it contains only digits and is between 10-15 characters
    return bool(re.match(r'^\d{10,15}$', cleaned))


def validate_registration_code(code: str) -> bool:
    """
    Validate registration code format
    
    Args:
        code: Registration code to validate
        
    Returns:
        bool: True if valid format
    """
    # Format: VIP-XXXXXXXX (VIP- followed by 8 alphanumeric characters)
    pattern = r'^VIP-[A-Z0-9]{8}$'
    return bool(re.match(pattern, code))


def generate_registration_code() -> str:
    """
    Generate a unique registration code for a fan
    Format: VIP-XXXXXXXX
    
    Returns:
        str: Registration code
    """
    # Generate 8 random uppercase alphanumeric characters
    random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return f"VIP-{random_part}"


def generate_ticket_id(fan_id: int, tour_id: int) -> str:
    """
    Generate a unique ticket ID
    Format: TKT-{TIMESTAMP}-{FAN_ID}-{TOUR_ID}-{RANDOM}
    
    Args:
        fan_id: Fan ID
        tour_id: Tour ID
        
    Returns:
        str: Unique ticket ID
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
    return f"TKT-{timestamp}-{fan_id}-{tour_id}-{random_suffix}"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to remove unsafe characters
    
    Args:
        filename: Original filename
        
    Returns:
        str: Sanitized filename
    """
    # Remove or replace unsafe characters
    filename = re.sub(r'[^\w\s\-\.]', '', filename)
    filename = re.sub(r'[\s]+', '_', filename)
    return filename.strip('._')


def validate_age(date_of_birth: datetime, min_age: int = 18) -> bool:
    """
    Validate that a person is at least min_age years old
    
    Args:
        date_of_birth: Date of birth
        min_age: Minimum required age (default: 18)
        
    Returns:
        bool: True if person is old enough
    """
    from datetime import date
    
    if isinstance(date_of_birth, datetime):
        dob = date_of_birth.date()
    else:
        dob = date_of_birth
    
    today = date.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age >= min_age


def format_phone(phone: str) -> str:
    """
    Format phone number to a standard format
    Example: 1234567890 -> (123) 456-7890
    
    Args:
        phone: Phone number
        
    Returns:
        str: Formatted phone number
    """
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    else:
        return phone  # Return as-is if format is unexpected


def truncate_string(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate a string to a maximum length
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated
        
    Returns:
        str: Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix