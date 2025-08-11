import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Container,
} from '@mui/material';
import { PopularSport } from '../../types';

interface PopularSportsProps {
  sports?: PopularSport[];
  onSportClick?: (sportId: string) => void;
}

const defaultSports: PopularSport[] = [
  {
    id: 'badminton',
    name: 'Badminton',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
  {
    id: 'football',
    name: 'Football',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
  {
    id: 'cricket',
    name: 'Cricket',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
  {
    id: 'swimming',
    name: 'Swimming',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
  {
    id: 'tennis',
    name: 'Tennis',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=250&fit=crop&auto=format',
    venueCount: 0,
  },
];

const PopularSports: React.FC<PopularSportsProps> = ({
  sports = defaultSports,
  onSportClick,
}) => {
  const handleSportClick = (sportId: string) => {
    onSportClick?.(sportId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
          }}
        >
          Popular Sports
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Discover and book venues for your favorite sports activities
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
        {sports.map((sport) => (
          <Box key={sport.id} sx={{ width: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(16.66% - 20px)' } }}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => handleSportClick(sport.id)}
            >
              {/* Sport Image */}
              <CardMedia
                component="img"
                height="120"
                image={sport.image}
                alt={sport.name}
                sx={{
                  objectFit: 'cover',
                  filter: 'brightness(0.8)',
                }}
                onError={(e) => {
                  // Fallback to a default sports image if the URL fails
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/400x250/2196F3/ffffff?text=${encodeURIComponent(sport.name)}`;
                }}
              />

              {/* Overlay Content */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'white',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  }}
                >
                  {sport.name}
                </Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default PopularSports;
