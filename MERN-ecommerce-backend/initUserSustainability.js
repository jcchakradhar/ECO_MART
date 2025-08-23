require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./model/User');

async function main() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('Missing MONGO_URI in .env');
        process.exit(1);
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected');

    const users = await User.find({}).exec();
    let updated = 0;
    for (const u of users) {
        let changed = false;

        if (!Array.isArray(u.searchHistory)) {
            u.searchHistory = [];
            changed = true;
        }

        if (!Array.isArray(u.purchase_history)) {
            u.purchase_history = [];
            changed = true;
        }

        // Ensure weights object and defaults
        if (!u.weights || typeof u.weights !== 'object') {
            u.weights = { carbon: 0.4, water: 0.3, rating: 0.3 };
            changed = true;
        } else {
            if (typeof u.weights.carbon !== 'number') { u.weights.carbon = 0.4; changed = true; }
            if (typeof u.weights.water !== 'number') { u.weights.water = 0.3; changed = true; }
            if (typeof u.weights.rating !== 'number') { u.weights.rating = 0.3; changed = true; }
        }

        if (typeof u.price_tolerance !== 'number') { u.price_tolerance = 0.2; changed = true; }
        if (typeof u.eco_score !== 'number') { u.eco_score = 0; changed = true; }
        if (typeof u.water_score !== 'number') { u.water_score = 0; changed = true; }
        if (typeof u.carbon_saved !== 'number') { u.carbon_saved = 0; changed = true; }
        if (typeof u.water_saved !== 'number') { u.water_saved = 0; changed = true; }

        if (changed) {
            await u.save();
            updated += 1;
        }
    }

    console.log(`Backfill complete. Updated ${updated} users.`);
    await mongoose.disconnect();
}

main().catch(async (e) => {
    console.error(e);
    try { await mongoose.disconnect(); } catch { }
    process.exit(1);
});
