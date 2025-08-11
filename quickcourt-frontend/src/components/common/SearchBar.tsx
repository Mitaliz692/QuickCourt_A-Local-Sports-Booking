import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { sanitizeInput, isValidLocation } from '../../utils/validation';

interface SearchBarProps {
  onSearch?: (location: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search for locations in Delhi...",
  defaultValue = "",
}) => {
  const [location, setLocation] = useState(defaultValue);
  const [error, setError] = useState('');

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(event.target.value);
    setLocation(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSearch = () => {
    const trimmedLocation = location.trim();
    
    if (!trimmedLocation) {
      setError('Please enter a location');
      return;
    }

    if (!isValidLocation(trimmedLocation)) {
      setError('Please enter a valid location (2-100 characters)');
      return;
    }

    setError('');
    onSearch?.(trimmedLocation);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          FIND PLAYERS & VENUES NEARBY
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            fontWeight: 400,
            mb: 4,
          }}
        >
          Seamlessly explore sports venues and play with sports enthusiasts just like you!
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 1,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={location}
            onChange={handleLocationChange}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiInputBase-input': {
                  py: 2,
                  fontSize: '1rem',
                },
              },
            }}
            sx={{
              '& .MuiFormHelperText-root': {
                position: 'absolute',
                top: '100%',
                left: 0,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{
              minWidth: 120,
              py: 2,
              px: 3,
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'grey.300',
              },
            }}
            disabled={!location.trim()}
          >
            Search
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchBar;
