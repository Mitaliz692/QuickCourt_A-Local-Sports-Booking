const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const Venue = require('../src/models/Venue');
const User = require('../src/models/User');

// Load environment variables
require('dotenv').config({ path: '../.env' });

async function createSampleBookingsForReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all venues and users
    const venues = await Venue.find({ status: 'approved' }).limit(3);
    const users = await User.find({ role: 'user' }).limit(2);

    if (venues.length === 0 || users.length === 0) {
      console.log('Need at least one venue and one user to create sample bookings');
      return;
    }

    console.log(`Found ${venues.length} venues and ${users.length} users`);

    // Sample bookings for reviews
    const sampleBookings = [];
    const today = new Date();
    const pastDates = [
      new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    ];

    for (let i = 0; i < Math.min(venues.length * users.length, 6); i++) {
      const venue = venues[i % venues.length];
      const user = users[i % users.length];
      const bookingDate = pastDates[i % pastDates.length];

      const booking = {
        userId: user._id,
        venueId: venue._id,
        facilityOwnerId: venue.ownerId,
        bookingDate: bookingDate,
        startTime: '10:00',
        endTime: '12:00',
        duration: 2,
        totalAmount: venue.pricePerHour * 2,
        status: 'completed',
        paymentDetails: {
          paymentMethod: 'card',
          paymentStatus: 'completed',
          transactionId: `txn_${Date.now()}_${i}`,
          paymentDate: new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours after booking
        },
        metadata: {
          playerCount: Math.floor(Math.random() * 8) + 2,
          specialRequests: i % 2 === 0 ? 'Please ensure court is clean' : '',
          source: 'web'
        }
      };

      sampleBookings.push(booking);
    }

    // Insert sample bookings
    const insertedBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ Created ${insertedBookings.length} sample completed bookings for reviews`);

    // Display booking details
    for (const booking of insertedBookings) {
      const venue = venues.find(v => v._id.toString() === booking.venueId.toString());
      const user = users.find(u => u._id.toString() === booking.userId.toString());
      console.log(`📝 Booking: ${user.fullName} booked ${venue.name} on ${booking.bookingDate.toDateString()} for ₹${booking.totalAmount}`);
    }

    console.log('\n🎉 Sample bookings created successfully!');
    console.log('These bookings are eligible for reviews in the user dashboard.');

  } catch (error) {
    console.error('❌ Error creating sample bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createSampleBookingsForReviews();
