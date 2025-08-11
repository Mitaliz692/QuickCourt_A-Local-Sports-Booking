# QuickCourt Frontend

A modern React TypeScript application for sports venue booking platform.

## Features

- **Modern UI**: Built with Material-UI for professional design
- **Responsive Design**: Mobile-first approach with responsive layouts
- **TypeScript**: Full type safety and better development experience
- **Component Architecture**: Reusable and maintainable components
- **Input Validation**: Comprehensive form validation utilities
- **Professional Theme**: Custom Material-UI theme with consistent styling

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common shared components
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── VenueCard.tsx
│   │   └── PopularSports.tsx
├── pages/              # Page components
│   └── HomePage.tsx
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── theme.ts        # Material-UI theme configuration
│   └── validation.ts   # Form validation utilities
└── assets/             # Static assets
```

## Key Components

### HomePage
- Hero section with search functionality
- Featured venues grid
- Popular sports categories
- Platform statistics

### Header
- Responsive navigation
- User authentication states
- Mobile-friendly drawer menu

### SearchBar
- Location-based venue search
- Input validation
- Professional styling

### VenueCard
- Venue information display
- Interactive booking buttons
- Favorite functionality
- Rating system

## Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Material-UI** - UI component library
- **React Hook Form** - Form handling
- **Emotion** - CSS-in-JS styling

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Styling Guidelines

- Uses Material-UI's theming system
- Consistent color palette and typography
- 8px spacing grid system
- Professional button and card styles
- Responsive breakpoints for mobile/tablet/desktop

## Validation

The application includes comprehensive input validation:
- Email format validation
- Password strength requirements
- Phone number validation
- Name and location validation
- Sanitization for security

## Future Enhancements

- User authentication integration
- Real-time booking system
- Payment gateway integration
- Map integration for venue locations
- Push notifications
