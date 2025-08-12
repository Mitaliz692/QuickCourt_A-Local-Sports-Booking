// Test script to check venue rating update
const mongoose = require('mongoose');

async function testVenueRating() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/quickcourt');
    console.log('Connected to MongoDB');

    const Venue = require('./quickcourt-backend/src/models/Venue');
    const Review = require('./quickcourt-backend/src/models/Review');

    // Find a venue with reviews
    const venues = await Venue.find({}).limit(5);
    console.log('Found venues:', venues.length);

    for (const venue of venues) {
      console.log(`\nVenue: ${venue.name} (${venue._id})`);
      console.log('Current rating:', venue.rating);

      // Find reviews for this venue
      const reviews = await Review.find({ venueId: venue._id });
      console.log('Reviews count:', reviews.length);

      if (reviews.length > 0) {
        console.log('Sample review ratings:', reviews.map(r => r.rating));
        
        // Calculate expected average
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const expectedAverage = total / reviews.length;
        console.log('Expected average:', expectedAverage);
      }
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

testVenueRating();
