const { spawn } = require('child_process');
const path = require('path');
const { User } = require('../model/User');
const { Order } = require('../model/Order');
const { Product } = require('../model/Product');
const mongoose = require('mongoose');

function gradeToScore(grade) {
    if (!grade || typeof grade !== 'string') return 0;
    const g = grade.trim().toUpperCase();
    switch (g) {
        case 'A': return 90;
        case 'B': return 75;
        case 'C': return 60;
        case 'D': return 45;
        case 'E': return 30;
        default: return 0;
    }
}

exports.generateMotivation = async (req, res) => {
    try {
        const userId = req.user.id;
        const [user, orders] = await Promise.all([
            User.findById(userId).lean(),
            Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
        ]);

        const search_history = Array.isArray(user?.searchHistory) ? user.searchHistory.slice(-5) : [];

        let purchase_history = [];
        if (Array.isArray(user?.purchase_history) && user.purchase_history.length) {
            const recentHistory = user.purchase_history.slice(-5).filter(Boolean);
            const objectIdCandidates = [];
            const productIdCandidates = [];

            for (const entry of recentHistory) {
                const value = typeof entry === 'object' && entry !== null ? entry._id || entry.id || entry : entry;
                if (!value) continue;
                const strValue = String(value);
                if (mongoose.Types.ObjectId.isValid(strValue) && strValue.length === 24) {
                    objectIdCandidates.push(new mongoose.Types.ObjectId(strValue));
                } else {
                    productIdCandidates.push(strValue);
                }
            }

            const filters = [];
            if (objectIdCandidates.length) {
                filters.push({ _id: { $in: objectIdCandidates } });
            }
            if (productIdCandidates.length) {
                filters.push({ product_id: { $in: productIdCandidates } });
            }

            let prods = [];
            if (filters.length === 1) {
                prods = await Product.find(filters[0]).select('title product_id brand').lean();
            } else if (filters.length > 1) {
                prods = await Product.find({ $or: filters }).select('title product_id brand').lean();
            }

            purchase_history = prods.map((p) => p?.title || p?.product_id || p?.brand || 'product');
        } else if (Array.isArray(orders)) {
            for (const order of orders) {
                if (Array.isArray(order.items)) {
                    for (const item of order.items) {
                        const p = item?.product || {};
                        const title = p.title || p.product_id || p.brand || 'product';
                        purchase_history.push(String(title));
                    }
                }
            }
        }

        let ecoAccum = 0, ecoCount = 0, waterAccum = 0, waterCount = 0;
        if (Array.isArray(orders)) {
            for (const order of orders) {
                if (Array.isArray(order.items)) {
                    for (const item of order.items) {
                        const p = item?.product || {};
                        if (p.Eco_Rating) { ecoAccum += gradeToScore(p.Eco_Rating); ecoCount += 1; }
                        if (p.Water_Rating) { waterAccum += gradeToScore(p.Water_Rating); waterCount += 1; }
                    }
                }
            }
        }

        const eco_score = typeof user?.eco_score === 'number' ? user.eco_score : (ecoCount ? Math.round(ecoAccum / ecoCount) : 0);
        const water_score = typeof user?.water_score === 'number' ? user.water_score : (waterCount ? Math.round(waterAccum / waterCount) : 0);
        const carbon_saved = typeof user?.carbon_saved === 'number' ? user.carbon_saved : 0;
        const water_saved = typeof user?.water_saved === 'number' ? user.water_saved : 0;

        const profile = {
            eco_score,
            water_score,
            carbon_saved,
            water_saved,
            search_history,
            purchase_history,
            weights: user?.weights || { carbon: 0.4, water: 0.3, rating: 0.3 },
            price_tolerance: typeof user?.price_tolerance === 'number' ? user.price_tolerance : 0.2,
        };

        const pythonExecutable = process.env.PYTHON || 'python';
        const recommendationDir = path.join(__dirname, '..', 'recommendation');
        const pyArgs = [
            '-c',
            "import json,sys,io;\n" +
            "# Ensure UTF-8 output on Windows\n" +
            "getattr(sys.stdout, 'reconfigure', lambda **k: None)(encoding='utf-8');\n" +
            "getattr(sys.stderr, 'reconfigure', lambda **k: None)(encoding='utf-8');\n" +
            "# Suppress top-level prints during import\n" +
            "buf=io.StringIO(); old=sys.stdout; sys.stdout=buf; import motivation as m; sys.stdout=old;\n" +
            "data=json.load(sys.stdin); msg=m.generate_motivation(data); print(msg)",
        ];
        const child = spawn(pythonExecutable, pyArgs, {
            cwd: recommendationDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
        });
        let stdout = '', stderr = '';
        child.stdout.on('data', (d) => (stdout += d.toString()));
        child.stderr.on('data', (d) => (stderr += d.toString()));
        child.on('error', (err) => console.error('[motivation] spawn error:', err?.message || err));
        child.on('close', (code) => {
            if (code !== 0) {
                console.error('[motivation] python exited with code', code, stderr);
                return res.status(200).json({
                    message: '✨ Small steps make a big difference. Try one more eco-friendly switch today! 🌍 Every choice matters — start small, change the world. 💡 Even tiny eco-friendly changes ripple into a huge impact.',
                    source: 'fallback',
                });
            }
            return res.status(200).json({ message: stdout.trim(), source: 'python' });
        });
        try { child.stdin.write(JSON.stringify(profile)); child.stdin.end(); } catch (e) { }
    } catch (err) {
        console.error('[motivation] error:', err);
        res.status(200).json({
            message: '✨ Small steps make a big difference.',
            source: 'fallback',
        });
    }
};
