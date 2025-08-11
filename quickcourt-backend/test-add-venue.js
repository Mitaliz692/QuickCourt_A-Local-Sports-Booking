const mongoose = require('mongoose');
const User = require('./src/models/User');
const Venue = require('./src/models/Venue');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quickcourt', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestVenue() {
  try {
    console.log('Creating test venue...');

    // First, create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test.facility@example.com' });
    
    if (!testUser) {
      testUser = new User({
        fullName: 'Test Facility Owner',
        email: 'test.facility@example.com',
        password: '$2b$10$dummy.hash.for.testing', // Dummy hash
        phone: '9876543210',
        role: 'facility_owner',
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });
      await testUser.save();
      console.log('Test user created:', testUser._id);
    }

    // Create a test venue
    const testVenue = new Venue({
      name: 'Test Sports Complex',
      description: 'A premium sports facility with multiple courts and modern amenities',
      ownerId: testUser._id,
      address: {
        street: '123 Sports Lane',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        country: 'India',
        coordinates: {
          latitude: 23.0225,
          longitude: 72.5714
        }
      },
      sportsSupported: ['Badminton', 'Tennis', 'Basketball'],
      amenities: ['Parking', 'Washrooms', 'Cafeteria', 'Locker Rooms'],
      priceRange: {
        min: 500,
        max: 1500,
        currency: 'INR'
      },
      operatingHours: {
        monday: { open: '06:00', close: '22:00', isOpen: true },
        tuesday: { open: '06:00', close: '22:00', isOpen: true },
        wednesday: { open: '06:00', close: '22:00', isOpen: true },
        thursday: { open: '06:00', close: '22:00', isOpen: true },
        friday: { open: '06:00', close: '22:00', isOpen: true },
        saturday: { open: '06:00', close: '23:00', isOpen: true },
        sunday: { open: '07:00', close: '21:00', isOpen: true }
      },
      contactInfo: {
        phone: '9876543210',
        email: 'test.facility@example.com',
        website: 'https://testsportscomplex.com'
      },
      images: [
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
      ],
      status: 'approved', // Auto-approved as per new requirement
      isActive: true,
      rating: {
        average: 4.5,
        count: 12
      }
    });

    await testVenue.save();
    console.log('Test venue created successfully:', testVenue._id);
    console.log('Venue name:', testVenue.name);
    console.log('Status:', testVenue.status);
    console.log('Active:', testVenue.isActive);

    // Verify the venue appears in the API
    const venues = await Venue.find({ status: 'approved', isActive: true });
    console.log(`\nTotal approved venues: ${venues.length}`);
    venues.forEach(v => console.log(`- ${v.name} (${v.status})`));

  } catch (error) {
    console.error('Error creating test venue:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestVenue();
