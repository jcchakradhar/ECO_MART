const { Cart } = require('../model/Cart');
const { Product } = require('../model/Product');

const RECOMMENDATION_BASE_URL = process.env.RECOMMENDATION_SERVICE_URL || process.env.RECOMMENDATION_URL || 'http://127.0.0.1:5001';
const RECOMMENDATION_TIMEOUT_MS = Number(process.env.RECOMMENDATION_TIMEOUT_MS) || 8000;
const hasAbortTimeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function';

async function markUserPersonalized(userId) {
  if (!RECOMMENDATION_BASE_URL) return;

  const userIdStr = typeof userId === 'string' ? userId : userId?.toString();
  if (!userIdStr) return;

  const headers = {
    Accept: 'application/json',
    'X-User-Id': userIdStr,
  };

  const options = { method: 'POST', headers };
  if (hasAbortTimeout) {
    options.signal = AbortSignal.timeout(RECOMMENDATION_TIMEOUT_MS);
  }

  try {
    const response = await fetch(`${RECOMMENDATION_BASE_URL}/api/user/mark-personalized`, options);
    if (!response.ok) {
      console.error(`[cart] mark-personalized failed: ${response.status}`);
    }
  } catch (error) {
    console.error('[cart] mark-personalized error:', error?.message || error);
  }
}

exports.fetchCartByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const cartItems = await Cart.find({ user: id }).populate('product');

    res.status(200).json(cartItems);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.addToCart = async (req, res) => {
  const { id } = req.user;
  const cart = new Cart({ ...req.body, user: id });
  try {
    // Backfill product_id if not provided (hook will also do it, but this keeps response consistent)
    if (!cart.product_id && cart.product) {
      const prod = await Product.findById(cart.product).select('product_id');
      cart.product_id = prod ? prod.product_id : undefined;
    }
    const doc = await cart.save();
    const result = await doc.populate('product');
    markUserPersonalized(id).catch(() => { });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteFromCart = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await Cart.findByIdAndDelete(id);
    res.status(200).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    const result = await cart.populate('product');

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};
