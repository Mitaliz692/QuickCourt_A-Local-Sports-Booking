const mongoose = require('mongoose');
const Booking = require('./src/models/Booking');
const Venue = require('./src/models/Venue');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quickcourt');

const createSampleBookings = async () => {
  try {
    console.log('Creating sample booking data...');

    // Find facility owners and their venues
    const facilityOwners = await User.find({ role: 'facility_owner' });
    console.log('Found facility owners:', facilityOwners.length);

    if (facilityOwners.length === 0) {
      console.log('No facility owners found. Please create some first.');
      return;
    }

    const venues = await Venue.find({ ownerId: { $in: facilityOwners.map(owner => owner._id) } });
    console.log('Found venues:', venues.length);

    if (venues.length === 0) {
      console.log('No venues found. Please create some first.');
      return;
    }

    // Find regular users
    const regularUsers = await User.find({ role: 'user' });
    console.log('Found regular users:', regularUsers.length);

    if (regularUsers.length === 0) {
      console.log('No regular users found. Please create some first.');
      return;
    }

    // Create sample bookings for the last 60 days
    const sampleBookings = [];
    const statuses = ['confirmed', 'completed', 'cancelled', 'pending'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'];
    const sports = ['Football', 'Basketball', 'Tennis', 'Badminton', 'Cricket'];

    for (let i = 0; i < 60; i++) {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - i);

      // Create 1-5 bookings per day
      const bookingsPerDay = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < bookingsPerDay; j++) {
        const randomVenue = venues[Math.floor(Math.random() * venues.length)];
        const randomUser = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const randomTime = times[Math.floor(Math.random() * times.length)];
        const randomSport = sports[Math.floor(Math.random() * sports.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomAmount = Math.floor(Math.random() * 3000) + 500; // ₹500-₹3500 for Indian pricing

        const booking = {
          userId: randomUser._id,
          venueId: randomVenue._id,
          sport: randomSport,
          bookingDate: bookingDate,
          startTime: randomTime,
          duration: Math.floor(Math.random() * 3) + 1, // 1-3 hours
          selectedComponents: [{
            id: 'comp1',
            name: `${randomSport} Court`,
            type: 'court',
            sport: randomSport,
            pricePerHour: randomAmount / 2,
            features: ['lighting', 'equipment'],
            isAvailable: true
          }],
          totalAmount: randomAmount,
          status: randomStatus,
          paymentDetails: {
            paymentMethod: 'stripe',
            paymentStatus: randomStatus === 'confirmed' || randomStatus === 'completed' ? 'completed' : 'pending',
            paidAmount: randomStatus === 'confirmed' || randomStatus === 'completed' ? randomAmount : 0,
          },
          createdAt: new Date(bookingDate.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time within the day
          updatedAt: new Date()
        };

        sampleBookings.push(booking);
      }
    }

    console.log(`Creating ${sampleBookings.length} sample bookings...`);

    // Clear existing bookings (optional - comment out if you want to keep existing data)
    // await Booking.deleteMany({});

    // Insert sample bookings
    await Booking.insertMany(sampleBookings);

    console.log('Sample bookings created successfully!');
    console.log(`Total bookings in database: ${await Booking.countDocuments()}`);

    // Show some stats
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    console.log('Booking stats by status:', stats);

  } catch (error) {
    console.error('Error creating sample bookings:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleBookings();
