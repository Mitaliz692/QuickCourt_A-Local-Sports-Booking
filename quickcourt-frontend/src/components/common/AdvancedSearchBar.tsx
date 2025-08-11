import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Slider,
  FormControlLabel,
  Checkbox,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  TuneRounded as TuneIcon,
} from '@mui/icons-material';
import { sanitizeInput, isValidLocation } from '../../utils/validation';

export interface SearchFilters {
  location: string;
  sports: string[];
  priceRange: [number, number];
  rating: number;
  amenities: string[];
  sortBy: 'name' | 'rating' | 'price' | 'newest';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchBarProps {
  onSearch?: (filters: SearchFilters) => void;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  initialFilters?: Partial<SearchFilters>;
}

const SPORTS_OPTIONS = [
  'Badminton',
  'Tennis',
  'Football',
  'Cricket',
  'Basketball',
  'Swimming',
  'Volleyball',
  'Table Tennis',
  'Squash',
  'Gym/Fitness',
];

const AMENITIES_OPTIONS = [
  'Parking',
  'Changing Rooms',
  'Shower Facilities',
  'Equipment Rental',
  'Refreshments',
  'Air Conditioning',
  'Lighting',
  'Restrooms',
  'First Aid',
  'WiFi',
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'newest', label: 'Newest' },
];

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  onSearch,
  placeholder = "Search for venues, locations, or sports...",
  showAdvancedFilters = true,
  initialFilters = {},
}) => {
  const defaultFilters: SearchFilters = {
    location: '',
    sports: [],
    priceRange: [0, 5000],
    rating: 0,
    amenities: [],
    sortBy: 'rating',
    sortOrder: 'desc',
    ...initialFilters,
  };

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(event.target.value);
    setFilters(prev => ({ ...prev, location: value }));
    
    if (error) {
      setError('');
    }
  };

  const handleSportsChange = (event: any) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, sports: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleAmenitiesChange = (event: any) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, amenities: typeof value === 'string' ? value.split(',') : value }));
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setFilters(prev => ({ ...prev, priceRange: newValue as [number, number] }));
  };

  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    setFilters(prev => ({ ...prev, rating: newValue as number }));
  };

  const handleSortChange = (field: keyof Pick<SearchFilters, 'sortBy' | 'sortOrder'>, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const trimmedLocation = filters.location.trim();
    
    if (trimmedLocation && !isValidLocation(trimmedLocation)) {
      setError('Please enter a valid location (2-100 characters)');
      return;
    }

    setError('');
    onSearch?.(filters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    onSearch?.(defaultFilters);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = () => {
    return (
      filters.sports.length > 0 ||
      filters.amenities.length > 0 ||
      filters.rating > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 5000 ||
      filters.sortBy !== 'rating' ||
      filters.sortOrder !== 'desc'
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Main Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: showFilters ? 2 : 0 }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={filters.location}
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
                  py: 1.5,
                  fontSize: '1rem',
                },
              },
            }}
          />
          
          {showAdvancedFilters && (
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                minWidth: 48,
                height: 48,
                bgcolor: hasActiveFilters() ? 'primary.main' : 'grey.100',
                color: hasActiveFilters() ? 'white' : 'text.secondary',
                '&:hover': {
                  bgcolor: hasActiveFilters() ? 'primary.dark' : 'grey.200',
                },
              }}
            >
              <TuneIcon />
            </IconButton>
          )}
          
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{
              minWidth: 120,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Search
          </Button>
        </Box>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Collapse in={showFilters}>
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* First Row - Sports and Amenities */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  {/* Sports Filter */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sports</InputLabel>
                      <Select
                        multiple
                        value={filters.sports}
                        onChange={handleSportsChange}
                        input={<OutlinedInput label="Sports" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {SPORTS_OPTIONS.map((sport) => (
                          <MenuItem key={sport} value={sport}>
                            {sport}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Amenities Filter */}
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Amenities</InputLabel>
                      <Select
                        multiple
                        value={filters.amenities}
                        onChange={handleAmenitiesChange}
                        input={<OutlinedInput label="Amenities" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {AMENITIES_OPTIONS.map((amenity) => (
                          <MenuItem key={amenity} value={amenity}>
                            {amenity}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Second Row - Sort and Clear */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  {/* Sort By */}
                  <Box sx={{ minWidth: 150 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sortBy}
                        onChange={(e) => handleSortChange('sortBy', e.target.value)}
                        label="Sort By"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Sort Order */}
                  <Box sx={{ minWidth: 120 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={filters.sortOrder}
                        onChange={(e) => handleSortChange('sortOrder', e.target.value)}
                        label="Order"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Clear Filters */}
                  <Box sx={{ minWidth: 120 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<ClearIcon />}
                      size="small"
                      sx={{ height: 40 }}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Box>

                {/* Third Row - Sliders */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                  {/* Price Range */}
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Typography gutterBottom variant="body2" color="text.secondary">
                      Price Range (₹{filters.priceRange[0]} - ₹{filters.priceRange[1]})
                    </Typography>
                    <Slider
                      value={filters.priceRange}
                      onChange={handlePriceRangeChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5000}
                      step={100}
                      valueLabelFormat={(value) => `₹${value}`}
                    />
                  </Box>

                  {/* Rating Filter */}
                  <Box sx={{ flex: 1, minWidth: 250 }}>
                    <Typography gutterBottom variant="body2" color="text.secondary">
                      Minimum Rating ({filters.rating}+ stars)
                    </Typography>
                    <Slider
                      value={filters.rating}
                      onChange={handleRatingChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.5}
                      marks={[
                        { value: 0, label: 'Any' },
                        { value: 2.5, label: '2.5+' },
                        { value: 4, label: '4+' },
                        { value: 5, label: '5' },
                      ]}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Active Filters Summary */}
              {hasActiveFilters() && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Filters:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.sports.map((sport) => (
                      <Chip
                        key={sport}
                        label={sport}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {filters.amenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                    {filters.rating > 0 && (
                      <Chip
                        label={`${filters.rating}+ stars`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                    {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
                      <Chip
                        label={`₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>
        )}
      </Paper>
    </Container>
  );
};

export default AdvancedSearchBar;
