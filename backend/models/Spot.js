import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  
  // Geospatial Data for the ML Engine to query
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  pricePerHour: { type: Number, required: true },
  totalCapacity: { type: Number, default: 1 },
  currentlyAvailable: { type: Number, default: 1 },
  
  features: {
    hasCCTV: { type: Boolean, default: false },
    hasEVCharging: { type: Boolean, default: false },
    isCovered: { type: Boolean, default: false }
  },

  // Future-proofing for real IoT integration
  iotSensorId: { type: String, default: null },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Spot', spotSchema);