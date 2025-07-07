const mongoose = require('mongoose');
const Room = require('./models/room');
require('dotenv').config();

const rooms = [];

// 🏠 PrabhuKripa PG
const prabhukripaGround = [
  "101", "102", "103", "104", "105", "106", "107", "108", "109", "110",
  "111", "111A", "111B", "114", "115", "116", "117", "118", "119", "120"
];

const prabhukripaFirst = [
  "201", "202", "203", "204", "206", "207", "208", "209", "210",
  "211", "211A", "211B", "214", "215", "216", "217", "218", "219", "220"
];

// 🏠 PrabhuKripa Residency
const residencyGround = ["1", "2", "3", "4", "5"];
const residencyFirst = ["1", "2", "3"];

prabhukripaGround.forEach(room => {
  rooms.push({ pg: "PrabhuKripa PG", floor: "Ground Floor", room: room.trim(), status: "Available" });
});
prabhukripaFirst.forEach(room => {
  rooms.push({ pg: "PrabhuKripa PG", floor: "First Floor", room: room.trim(), status: "Available" });
});
residencyGround.forEach(room => {
  rooms.push({ pg: "PrabhuKripa Residency", floor: "Ground Floor", room: room.trim(), status: "Available" });
});
residencyFirst.forEach(room => {
  rooms.push({ pg: "PrabhuKripa Residency", floor: "First Floor", room: room.trim(), status: "Available" });
});

// Export seeding function
module.exports = async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await Room.find({});
    if (existing.length > 0) {
      console.log("✅ Rooms already exist. Skipping seeding.");
      return;
    }

    await Room.insertMany(rooms);
    console.log("✅ Room data seeded on Render.");
  } catch (err) {
    console.error("❌ Error seeding room data:", err);
  }
};
