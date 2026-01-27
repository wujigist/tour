# VIP Fan Experience Application

A full-stack web application that allows fans to select tours, complete consent forms, and receive personalized VIP tickets.

## Features

- **Tour Selection**: Fans can browse and select up to 5 tours
- **Consent Management**: Digital consent form with photo ID upload
- **Ticket Generation**: Automated VIP ticket creation with QR codes
- **Secure Downloads**: Blurred preview until consent is completed
- **Email Notifications**: Automated ticket delivery

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database management
- **Alembic**: Database migrations
- **ReportLab**: PDF ticket generation
- **QRCode**: QR code generation for tickets

### Frontend
- **React**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Navigation
- **TailwindCSS**: Styling
- **Axios**: API communication

## Project Structure

```
exec/
├── backend/          # FastAPI backend
│   ├── alembic/     # Database migrations
│   ├── app/         # Application code
│   ├── tickets/     # Generated tickets
│   └── uploads/     # User uploads
└── frontend/        # React frontend
    └── src/         # Source code
```

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL (or SQLite for development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with backend URL
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development Workflow

1. **Database Changes**: Create Alembic migration
2. **Backend API**: Add routes in `app/routes/`
3. **Business Logic**: Implement in `app/services/`
4. **Frontend Pages**: Create in `src/pages/`
5. **Components**: Build reusable components in `src/components/`

## Key Features Implementation

### Tour Selection
- Max 5 tours per fan
- Real-time validation
- Persistent selection state

### Consent Form
- Legal agreements
- Photo ID upload (optional)
- Age verification
- Digital signature

### Ticket Generation
- Unique ticket IDs
- QR code for verification
- PDF format with VIP branding
- Secure download links

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend (Heroku/Railway)
```bash
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

## Environment Variables

### Backend
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `MAIL_SERVER`: Email server
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password

### Frontend
- `VITE_API_URL`: Backend API URL

## Security Considerations

- Email verification for fan registration
- Rate limiting on API endpoints
- Secure ticket download links with expiration
- Photo ID stored securely
- CORS configuration for production

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.