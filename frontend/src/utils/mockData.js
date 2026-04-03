export const MOCK_USER = {
  name: 'Shreya Prakash',
  email: 'shreya@vaahan.app',
  profilePicture: 'https://placehold.co/100x100/EBF3E8/4F6F52?text=SP',
  memberSince: 'Jan 2024',
  ridesTaken: 42,
  ridesDriven: 15,
  co2Saved: 85.5, // in kg
  points: 1250,
  level: 'Eco-Warrior',
};

export const MOCK_LEADERBOARD = [
  { id: '1', name: 'Manik P.', points: 2100, rank: 1 },
  { id: '2', name: 'Aastha A.', points: 1850, rank: 2 },
  { id: '3', name: 'You (Shreya P.)', points: 1250, rank: 3, isUser: true },
  { id: '4', name: 'Lokesh S.', points: 980, rank: 4 },
  { id: '5', name: 'Drishti N.', points: 750, rank: 5 },
];

export const MOCK_BADGES = [
  { id: '1', name: 'First Ride', earned: true },
  { id: '2', name: 'Community Builder', earned: true },
  { id: '3', name: 'Parking Pro', earned: false },
  { id: '4', name: 'Eco-Warrior', earned: true },
];

export const MOCK_PARKING_SPOTS = [
    {id: 'p1', name: 'Central Mall Parking', distance: '0.5 km', available: 25, total: 200},
    {id: 'p2', name: 'City Center Lot B', distance: '1.2 km', available: 5, total: 50},
    {id: 'p3', name: 'Metro Station Parking', distance: '2.1 km', available: 80, total: 300},
    {id: 'p4', name: 'Downtown Garage', distance: '3.5 km', available: 2, total: 150},
];

export const MOCK_WALLET = {
  balance: 550.75,
  transactions: [
    { id: '1', type: 'Ride Payment', amount: -75.00, date: '2025-08-03' },
    { id: '2', type: 'Wallet Top-up', amount: 500.00, date: '2025-08-01' },
    { id: '3', type: 'Reward from Gamification', amount: 25.00, date: '2025-07-28' },
    { id: '4', type: 'Parking Fee', amount: -50.00, date: '2025-07-25' },
    { id: '5', type: 'Ride Payment', amount: -125.25, date: '2025-07-22' },
  ],
};

