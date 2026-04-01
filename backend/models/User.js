import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed in production
  
  // Role: 0 = Rider, 1 = Driver, 2 = Both
  userType: { type: Number, default: 0 }, 
  
  // Gamification & Trust Layer
  ecoPoints: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 }, // Tracks total earned for leveling up
  carbonSavedKg: { type: Number, default: 0 },
  trustScore: { type: Number, default: 5.0 },
  skills: { type: [String], default: [] },
  // Vehicle details (Only required if they are a driver)
  vehicle: {
    make: String,
    model: String,
    plateNumber: String,
    seatsAvailable: { type: Number, default: 3 }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);