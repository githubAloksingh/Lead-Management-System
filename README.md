# Lead Management SaaS

A full-stack lead management system built with React, Express, and PostgreSQL.

## Features

- 🔐 **Secure Authentication**: JWT with httpOnly cookies and bcrypt password hashing
- 📊 **Lead Management**: Complete CRUD operations with advanced filtering
- 📄 **Server-side Pagination**: Efficient data loading with customizable page sizes
- 🔍 **Advanced Filtering**: Filter by name, email, company, source, status, score, and qualification status
- 📱 **Responsive Design**: Mobile-first approach with TailwindCSS
- 🎨 **Modern UI**: Professional interface with AG Grid for data management
- 🚨 **Toast Notifications**: Real-time feedback for all user actions
- 📈 **Lead Scoring**: Visual score representation with progress bars
- 🏷️ **Status Badges**: Color-coded status and source indicators

## Demo Account

**Email**: test@example.com  
**Password**: password123

*This account comes pre-loaded with 150+ sample leads for testing.*

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- React Hook Form for form handling
- AG Grid for data tables
- TailwindCSS for styling
- React Hot Toast for notifications
- Headless UI for modals

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- Input validation with express-validator
- Security middleware (helmet, CORS, rate limiting)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lead-management-saas
```

2. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

3. **Database Setup**
```bash
# Create PostgreSQL database
createdb leadmanagement

# Update server/.env with your database URL
DATABASE_URL=postgresql://username:password@localhost:5432/leadmanagement
```

4. **Environment Configuration**
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3001/api

# Backend (server/.env)
DATABASE_URL=postgresql://localhost:5432/leadmanagement
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

5. **Start Development**
```bash
# Start backend (from root directory)
cd server && npm run dev

# Start frontend (in new terminal, from root)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
├── src/                     # Frontend React app
│   ├── components/          # Reusable components
│   ├── contexts/           # React contexts (Auth)
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   └── utils/              # API utilities
├── server/                  # Backend Express app
│   ├── config/             # Database and initialization
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get leads with pagination/filtering
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## Features in Detail

### Authentication
- Secure JWT authentication with httpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Automatic token refresh and validation
- Protected routes with React Router

### Lead Management
- Complete CRUD operations
- Real-time updates after create/edit/delete
- Input validation on both client and server
- Unique email constraint with proper error handling

### Pagination & Filtering
- Server-side pagination for performance
- Customizable page sizes (10, 20, 50, 100)
- Advanced filtering with multiple operators:
  - String fields: exact match and contains
  - Numeric fields: greater than, less than, between
  - Enums: exact match and multiple selection
  - Boolean fields: true/false selection

### Data Grid
- Professional AG Grid implementation
- Sortable columns
- Custom cell renderers for badges and actions
- Responsive design with mobile optimization
- Smooth animations and interactions

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render/Railway/Heroku)
```bash
cd server
# Set environment variables
# Deploy to your preferred platform
```

### Database (PostgreSQL)
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Update DATABASE_URL in production environment

## Security Features

- JWT tokens in httpOnly cookies (not localStorage)
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with Helmet.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.