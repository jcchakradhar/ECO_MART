require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const cookieParser = require('cookie-parser');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const motivationRouter = require('./routes/Motivation');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');
const { Order } = require('./model/Order');

// Stripe optional setup
const endpointSecret = process.env.ENDPOINT_SECRET;
let stripe = null;
const STRIPE_KEY = process.env.STRIPE_SERVER_KEY;
if (!STRIPE_KEY) {
  console.warn('[stripe] STRIPE_SERVER_KEY missing; payment endpoints will be limited.');
} else {
  try {
    stripe = require('stripe')(STRIPE_KEY);
  } catch (e) {
    console.error('[stripe] initialization failed:', e?.message || e);
  }
}

// middlewares
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_KEY || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.authenticate('session'));
server.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);
server.use(express.json());

// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

// Routes
server.use('/products', isAuth(), productsRouter.router);
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/users', isAuth(), usersRouter.router);
server.use('/motivation', isAuth(), motivationRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);

// Stripe webhook
server.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    if (!stripe) return response.send();
    const sig = request.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntentSucceeded = event.data.object;
          const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
          if (order) {
            order.paymentStatus = 'received';
            await order.save();
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      response.send();
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// React fallback
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// Passport Strategies
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) return done(null, false, { message: 'invalid credentials' });
      crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
        if (err) return done(err);
        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
          return done(null, false, { message: 'invalid credentials' });
        }
        const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
        done(null, { id: user.id, role: user.role, token });
      });
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) return done(null, sanitizeUser(user));
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments
server.post('/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(501).json({ error: 'Stripe not configured. Set STRIPE_SERVER_KEY in .env' });
  }
  const { totalAmount, orderId } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100,
    currency: 'inr',
    automatic_payment_methods: { enabled: true },
    metadata: { orderId },
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

// DB + server
main().catch((err) => console.log(err));
async function main() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('Missing MONGO_URI in environment');
    return;
  }
  mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('server started');
});
