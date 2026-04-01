import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The "Point C" calculated by your ML Engine
  hubLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    nodeId: { type: Number }
  },
  
  // Trip status flow
  status: { 
    type: String, 
    enum: ['matched', 'driver_at_hub', 'rider_at_hub', 'in_transit', 'completed', 'cancelled'],
    default: 'matched'
  },

  // Financials & Rewards (Saved from ML Engine output)
  priceUsd: { type: Number, required: true },
  ecoPointsAwarded: { type: Number, required: true },
  trafficRiskAtLaunch: { type: Number },

  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model('Trip', tripSchema);