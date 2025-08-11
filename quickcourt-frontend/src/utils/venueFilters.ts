import { Venue } from '../types';
import { SearchFilters } from '../components/common/AdvancedSearchBar';

export const filterVenues = (venues: Venue[], filters: SearchFilters): Venue[] => {
  let filteredVenues = [...venues];

  // Location filter (search in multiple fields)
  if (filters.location.trim()) {
    const searchTerm = filters.location.toLowerCase();
    filteredVenues = filteredVenues.filter(venue => {
      return (
        venue.name.toLowerCase().includes(searchTerm) ||
        venue.address.city.toLowerCase().includes(searchTerm) ||
        venue.address.state.toLowerCase().includes(searchTerm) ||
        venue.address.street.toLowerCase().includes(searchTerm) ||
        venue.address.zipCode.toLowerCase().includes(searchTerm) ||
        venue.description.toLowerCase().includes(searchTerm) ||
        venue.sportsSupported.some(sport => sport.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Sports filter
  if (filters.sports.length > 0) {
    filteredVenues = filteredVenues.filter(venue => {
      return filters.sports.some(sport => 
        venue.sportsSupported.some(venueSport => 
          venueSport.toLowerCase().includes(sport.toLowerCase())
        )
      );
    });
  }

  // Amenities filter
  if (filters.amenities.length > 0) {
    filteredVenues = filteredVenues.filter(venue => {
      return filters.amenities.some(amenity => 
        venue.amenities.some(venueAmenity => 
          venueAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
    });
  }

  // Price range filter
  filteredVenues = filteredVenues.filter(venue => {
    const venueMinPrice = venue.priceRange?.min || 0;
    const venueMaxPrice = venue.priceRange?.max || 0;
    
    // Check if venue price range overlaps with filter range
    return (
      (venueMinPrice >= filters.priceRange[0] && venueMinPrice <= filters.priceRange[1]) ||
      (venueMaxPrice >= filters.priceRange[0] && venueMaxPrice <= filters.priceRange[1]) ||
      (venueMinPrice <= filters.priceRange[0] && venueMaxPrice >= filters.priceRange[1])
    );
  });

  // Rating filter
  if (filters.rating > 0) {
    filteredVenues = filteredVenues.filter(venue => {
      return (venue.rating?.average || 0) >= filters.rating;
    });
  }

  // Sort venues
  filteredVenues.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rating':
        comparison = (b.rating?.average || 0) - (a.rating?.average || 0);
        break;
      case 'price':
        const aPrice = a.priceRange?.min || 0;
        const bPrice = b.priceRange?.min || 0;
        comparison = aPrice - bPrice;
        break;
      case 'newest':
        const aCreated = new Date((a as any).createdAt || '').getTime();
        const bCreated = new Date((b as any).createdAt || '').getTime();
        comparison = bCreated - aCreated;
        break;
      default:
        comparison = 0;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredVenues;
};

export const getSearchResultsSummary = (
  totalVenues: number,
  filteredVenues: number,
  filters: SearchFilters
): string => {
  if (totalVenues === 0) {
    return 'No venues available';
  }

  if (filteredVenues === totalVenues) {
    return `Showing all ${totalVenues} venues`;
  }

  const hasActiveFilters = 
    filters.location.trim() ||
    filters.sports.length > 0 ||
    filters.amenities.length > 0 ||
    filters.rating > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000;

  if (hasActiveFilters) {
    return `Found ${filteredVenues} of ${totalVenues} venues matching your criteria`;
  }

  return `Showing ${filteredVenues} venues`;
};

export const getFilteredVenueStats = (venues: Venue[]) => {
  const stats = {
    totalVenues: venues.length,
    averageRating: 0,
    priceRange: { min: Infinity, max: 0 },
    popularSports: {} as Record<string, number>,
    popularAmenities: {} as Record<string, number>,
    cities: {} as Record<string, number>,
  };

  if (venues.length === 0) return stats;

  let totalRating = 0;
  let ratedVenues = 0;

  venues.forEach(venue => {
    // Calculate average rating
    if (venue.rating?.average > 0) {
      totalRating += venue.rating.average;
      ratedVenues++;
    }

    // Calculate price range
    if (venue.priceRange?.min) {
      stats.priceRange.min = Math.min(stats.priceRange.min, venue.priceRange.min);
    }
    if (venue.priceRange?.max) {
      stats.priceRange.max = Math.max(stats.priceRange.max, venue.priceRange.max);
    }

    // Count sports
    venue.sportsSupported?.forEach(sport => {
      stats.popularSports[sport] = (stats.popularSports[sport] || 0) + 1;
    });

    // Count amenities
    venue.amenities?.forEach(amenity => {
      stats.popularAmenities[amenity] = (stats.popularAmenities[amenity] || 0) + 1;
    });

    // Count cities
    if (venue.address?.city) {
      stats.cities[venue.address.city] = (stats.cities[venue.address.city] || 0) + 1;
    }
  });

  stats.averageRating = ratedVenues > 0 ? totalRating / ratedVenues : 0;
  
  if (stats.priceRange.min === Infinity) {
    stats.priceRange.min = 0;
  }

  return stats;
};

export const generateSearchSuggestions = (venues: Venue[], currentSearch: string) => {
  const suggestions: string[] = [];
  const searchTerm = currentSearch.toLowerCase();

  if (searchTerm.length < 2) return suggestions;

  // Get unique suggestions from venue data
  const allSuggestions = new Set<string>();

  venues.forEach(venue => {
    // Add venue names
    if (venue.name.toLowerCase().includes(searchTerm)) {
      allSuggestions.add(venue.name);
    }

    // Add cities
    if (venue.address?.city.toLowerCase().includes(searchTerm)) {
      allSuggestions.add(venue.address.city);
    }

    // Add sports
    venue.sportsSupported?.forEach(sport => {
      if (sport.toLowerCase().includes(searchTerm)) {
        allSuggestions.add(sport);
      }
    });

    // Add amenities
    venue.amenities?.forEach(amenity => {
      if (amenity.toLowerCase().includes(searchTerm)) {
        allSuggestions.add(amenity);
      }
    });
  });

  return Array.from(allSuggestions).slice(0, 5); // Limit to 5 suggestions
};
