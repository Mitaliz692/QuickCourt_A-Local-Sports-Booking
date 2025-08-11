# QuickCourt - Sports Venue Booking Platform

A comprehensive sports venue booking platform built with React, TypeScript, Node.js, and MongoDB.

## 🏆 Features

### For Users
- **User Registration & Authentication** - Secure signup/login with email verification
- **Venue Discovery** - Browse and search sports venues by location and sport type
- **Detailed Venue Information** - View comprehensive venue details, amenities, and images
- **Booking System** - Book venues for specific time slots
- **Favorites** - Save preferred venues for quick access
- **Popular Sports** - Discover trending sports categories

### For Facility Owners
- **Facility Registration** - Easy registration process for venue owners
- **Venue Management** - Add, edit, and manage venue listings
- **Auto-Approval System** - Venues are automatically approved upon registration
- **Dashboard** - Comprehensive dashboard to manage all venues
- **Image Upload** - Upload venue images with proper CORS handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI) v6** for components
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email services
- **CORS** configured for cross-origin requests

## 📁 Project Structure

```
QuickCourt/
├── quickcourt-frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context providers
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Utility functions
│   └── public/                  # Static assets
├── quickcourt-backend/           # Node.js Express backend
│   ├── src/
│   │   ├── models/              # MongoDB schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Custom middleware
│   │   └── app.js               # Application entry point
│   └── uploads/                 # Uploaded venue images
└── uploads/                     # Shared upload directory
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd QuickCourt
   ```

2. **Setup Backend**
   ```bash
   cd quickcourt-backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../quickcourt-frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in `quickcourt-backend/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/quickcourt
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:3000
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd quickcourt-backend
   npm start
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd quickcourt-frontend
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get specific venue details
- `GET /api/venues/my-venues` - Get venues for logged-in facility owner
- `POST /api/venues` - Create new venue (facility owners)
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Facility Owners
- `POST /api/facility-owners/register` - Facility owner registration
- `POST /api/facility-owners/login` - Facility owner login

## 🔧 Key Features Implementation

### Auto-Approval System
Venues are automatically approved when created by facility owners, eliminating the need for manual approval processes.

### Image Upload & Management
- Secure file upload with Multer
- CORS-enabled image serving
- Proper URL handling for frontend display

### Authentication Flow
- JWT-based authentication
- Email verification system
- Role-based access (users vs facility owners)
- Persistent login state

### Responsive Design
- Mobile-first approach with Material-UI
- Responsive grid layouts
- Touch-friendly interface

## 🌟 Recent Updates

- ✅ Fixed auto-approval system for venues
- ✅ Implemented comprehensive venue details page
- ✅ Resolved authentication logout issues
- ✅ Fixed image display with proper CORS handling
- ✅ Added popular sports section with proper images
- ✅ Corrected API route ordering for proper functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

## 👥 Team Information

- **Team Leader**: Zenith Shah - zenithshah1912@gmail.com
- **Team Member**: Mitali Prajapati - prajapatimitali570@gmail.com

---

**Built with ❤️ for sports enthusiasts and venue owners**
