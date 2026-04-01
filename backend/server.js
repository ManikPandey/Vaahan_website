import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import our new models
import User from './models/User.js';
import Trip from './models/Trip.js';
import Spot from './models/Spot.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app); // Wrap Express
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use(cors());
app.use(express.json());

// --- 1. MONGODB CONNECTION ---
// Make sure you have MongoDB running locally, or use a MongoDB Atlas URI string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vahan_db';
const JWT_SECRET = process.env.JWT_SECRET || 'vahan_super_secret_key_2026';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected: Vahan Database active'))
  .catch(err => console.error('❌ Database connection error:', err));  


app.post('/api/web/auth/register', async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already in use." });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user (Give them 100 welcome Eco-Points)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            userType: userType || 0,
            ecoPoints: 100
        });

        await newUser.save();

        // Create Token
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
        
        // Remove password from response
        const userObj = newUser.toObject();
        delete userObj.password;

        res.json({ token, user: userObj });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Failed to register user." });
    }
});

// --- 2. AUTHENTICATION: LOGIN ---
app.post('/api/web/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials." });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ token, user: userObj });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Failed to login." });
    }
});

  // --- GET OR CREATE DEMO USER ---
app.get('/api/web/demo-user', async (req, res) => {
    try {
        let user = await User.findOne({ email: "demo@vahan.com" });
        if (!user) {
            user = new User({ 
                name: "Manik Pandey", 
                email: "demo@vahan.com", 
                password: "hashed_mock", // Mock password
                ecoPoints: 500, // Starting balance
                carbonSavedKg: 12.5
            });
            await user.save();
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

  // --- 2. WEB FILTERING & ML PROXY ROUTE ---
app.post('/api/web/request-match', async (req, res) => {
    try {
        // In a real app, driverId and riderId come from authenticated user sessions
        const { driver, rider, driverId, riderId } = req.body;

        // 1. Proxy to Python ML Engine
        const mlPayload = {
            driver_lat: driver.lat,
            driver_lng: driver.lng,
            rider_lat: rider.lat,
            rider_lng: rider.lng,
            user_type: 0,
            is_raining: 0
        };

        const mlResponse = await axios.post('http://127.0.0.1:8000/api/v1/route', mlPayload);
        const mlData = mlResponse.data;

        // 2. Save the Trip to MongoDB (Only if we have mock user IDs)
        // For testing, we will generate fake ObjectIds if none are provided
        const dId = driverId || new mongoose.Types.ObjectId();
        const rId = riderId || new mongoose.Types.ObjectId();

        const newTrip = new Trip({
            driverId: dId,
            riderId: rId,
            hubLocation: {
                lat: mlData.optimal_hub.lat,
                lng: mlData.optimal_hub.lng,
                nodeId: mlData.optimal_hub.node_id
            },
            priceUsd: mlData.intelligence.hub_price_usd,
            ecoPointsAwarded: mlData.intelligence.dynamic_incentive.eco_points_offered,
            trafficRiskAtLaunch: mlData.intelligence.ai_traffic_risk
        });

        await newTrip.save();
        console.log(`✅ Trip saved to DB with ID: ${newTrip._id}`);

        // 3. Update User Eco-Points (Gamification execution)
       const ecoPointsEarned = mlData.intelligence.dynamic_incentive?.eco_points_offered || 0;
        console.log(`💰 Attempting to add ${ecoPointsEarned} points to demo user...`);
        
        // Find our demo user, add points, and FORCE create them if they don't exist (upsert)
        const updatedUser = await User.findOneAndUpdate(
            { email: "demo@vahan.com" }, 
            { 
                $inc: { 
                    ecoPoints: ecoPointsEarned,
                    carbonSavedKg: (ecoPointsEarned * 0.015) 
                } 
            },
            { new: true, upsert: true } // <-- THIS IS THE CRITICAL FIX
        );
        
        console.log(`✅ Success! Demo User new balance: ${updatedUser.ecoPoints} Pts`);

        // 4. Send combined data back to React
        res.json({
            status: "success",
            trip_id: newTrip._id,
            ml_data: mlData
        });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: "Failed to process match." });
    }
});
// --- PROVIDER ROUTE: LIST A NEW SPOT ---
app.post('/api/web/spots', async (req, res) => {
    try {
        const { name, lat, lng, price, features } = req.body;
        
        const newSpot = new Spot({
            name,
            location: { lat, lng },
            pricePerHour: price,
            features
        });

        await newSpot.save();
        res.json({ status: "success", message: "Spot listed on Vahan Network!", spot: newSpot });
    } catch (error) {
        console.error("Spot Creation Error:", error);
        res.status(500).json({ error: "Failed to list spot" });
    }
});

// --- PROVIDER ROUTE: GET MY SPOTS ---
app.get('/api/web/spots', async (req, res) => {
    try {
        const spots = await Spot.find(); // In production, filter by ownerId
        res.json(spots);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch spots" });
    }
});


// --- UPDATE USER PROFILE (VEHICLE DETAILS) ---
app.put('/api/web/users/:id', async (req, res) => {
    try {
        const { vehicle } = req.body;
        
        // Find user by ID and update their vehicle object
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { vehicle: vehicle }, 
            { new: true } // Return the updated document
        ).select('-password'); // Don't send the password hash back
        
        res.json({ status: "success", user: updatedUser });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

// --- WALLET: TOP UP FUNDS ---
app.post('/api/web/users/:id/wallet/topup', async (req, res) => {
    try {
        const { amount } = req.body;
        
        // Find user and increment their wallet balance
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { $inc: { walletBalance: amount } }, 
            { new: true }
        ).select('-password');
        
        res.json({ status: "success", user: updatedUser });
    } catch (err) {
        console.error("Wallet Topup Error:", err);
        res.status(500).json({ error: "Failed to process payment." });
    }
});

// --- COMMUNITY CHAT: GET HISTORY ---
app.get('/api/web/chat/history', async (req, res) => {
    try {
        // Fetch the last 50 messages, sorted from oldest to newest
        const messages = await Message.find().sort({ createdAt: 1 }).limit(50);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// --- WEBSOCKETS: REAL-TIME CHAT ---
io.on('connection', (socket) => {
    console.log(`🔌 New client connected to chat: ${socket.id}`);

    // Listen for incoming messages from React
    socket.on('send_message', async (data) => {
        try {
            // 1. Save to MongoDB
            const newMessage = new Message({
                userId: data.userId,
                userName: data.userName,
                text: data.text
            });
            await newMessage.save();

            // 2. Broadcast the message to ALL connected users
            io.emit('receive_message', newMessage);
        } catch (error) {
            console.error("Chat Error:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// --- GAMIFICATION: GET FRESH USER DATA ---
app.get('/api/web/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user data." });
    }
});

// --- GAMIFICATION: UNLOCK SKILL ---
app.post('/api/web/users/:id/skills/unlock', async (req, res) => {
    try {
        const { skillId, cost } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.skills.includes(skillId)) return res.status(400).json({ error: "Skill already unlocked" });
        if (user.ecoPoints < cost) return res.status(400).json({ error: "Insufficient Eco-Points" });

        // Deduct points and push the new skill to the array
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { ecoPoints: -cost },
                $push: { skills: skillId }
            },
            { new: true }
        ).select('-password');

        res.json({ status: "success", user: updatedUser });
    } catch (err) {
        console.error("Skill Unlock Error:", err);
        res.status(500).json({ error: "Failed to unlock skill." });
    }
});

// --- GAMIFICATION: CLAIM REWARD ---
app.post('/api/web/users/:id/rewards/claim', async (req, res) => {
    try {
        const { pointsToAward } = req.body;

        // Add to both spendable wallet and lifetime total
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $inc: {
                    ecoPoints: pointsToAward,
                    lifetimePoints: pointsToAward
                }
            },
            { new: true }
        ).select('-password');

        res.json({ status: "success", user: updatedUser });
    } catch (err) {
        console.error("Reward Claim Error:", err);
        res.status(500).json({ error: "Failed to claim reward." });
    }
});

// --- 3. START SERVER ---
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Vahan Web & Socket Server running on port ${PORT}`);
});