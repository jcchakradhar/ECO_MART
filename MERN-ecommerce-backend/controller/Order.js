const { Order } = require("../model/Order");
const { Product } = require("../model/Product");
const { User } = require("../model/User");
const mongoose = require('mongoose');
const { sendMail, invoiceTemplate } = require("../services/common");

const RECOMMENDATION_BASE_URL = process.env.RECOMMENDATION_SERVICE_URL || process.env.RECOMMENDATION_URL || 'http://127.0.0.1:5001';
const RECOMMENDATION_TIMEOUT_MS = Number(process.env.RECOMMENDATION_TIMEOUT_MS) || 8000;
const hasAbortTimeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function';

const maybeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

async function syncUserSustainability(userId, productIds) {
  if (!Array.isArray(productIds) || !productIds.length) return null;
  if (!RECOMMENDATION_BASE_URL) return null;

  const userIdStr = typeof userId === 'string' ? userId : userId?.toString();
  if (!userIdStr) return null;

  console.log('[orders] Triggering sustainability updates for product_ids:', productIds);

  let latestProfile = null;

  const buildOptions = (method) => {
    const headers = {
      Accept: 'application/json',
      'X-User-Id': userIdStr,
    };
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }
    const opts = { method, headers };
    if (hasAbortTimeout) {
      opts.signal = AbortSignal.timeout(RECOMMENDATION_TIMEOUT_MS);
    }
    return opts;
  };

  const callEndpoint = async (path, method) => {
    try {
      const response = await fetch(`${RECOMMENDATION_BASE_URL}${path}`, buildOptions(method));
      if (!response.ok) {
        console.error(`[orders] ${method} ${path} failed: ${response.status}`);
        return null;
      }
      return response.json().catch(() => null);
    } catch (error) {
      console.error(`[orders] ${method} ${path} error:`, error?.message || error);
      return null;
    }
  };

  for (const rawPid of productIds) {
    if (!rawPid) continue;
    const pid = encodeURIComponent(String(rawPid));

    const profileAfterWeights = await callEndpoint(`/api/user/update-profile/${pid}`, 'POST');
    if (profileAfterWeights) {
      latestProfile = profileAfterWeights;
    }

    const profileAfterScore = await callEndpoint(`/api/score/${pid}/false`, 'GET');
    if (profileAfterScore) {
      latestProfile = profileAfterScore;
    }
  }

  if (!latestProfile || typeof latestProfile !== 'object') return null;

  const updatePayload = {};

  if (latestProfile.weights && typeof latestProfile.weights === 'object') {
    const carbon = maybeNumber(latestProfile.weights.carbon);
    const water = maybeNumber(latestProfile.weights.water);
    const rating = maybeNumber(latestProfile.weights.rating);
    if (carbon !== null && water !== null && rating !== null) {
      updatePayload.weights = { carbon, water, rating };
    }
  }

  const priceTolerance = maybeNumber(latestProfile.price_tolerance);
  if (priceTolerance !== null) {
    updatePayload.price_tolerance = priceTolerance;
  }

  ['eco_score', 'water_score', 'carbon_saved', 'water_saved'].forEach((key) => {
    const val = maybeNumber(latestProfile[key]);
    if (val !== null) {
      updatePayload[key] = val;
    }
  });

  if (!Object.keys(updatePayload).length) return null;

  await User.findByIdAndUpdate(userId, { $set: updatePayload });

  return updatePayload;
}

exports.fetchOrdersByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.find({ user: id });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.createOrder = async (req, res) => {
  const order = new Order(req.body);
  // here we have to update stocks;

  for (let item of order.items) {
    let product = await Product.findOne({ _id: item.product.id })
    product.$inc('stock', -1 * item.quantity);
    // for optimum performance we should make inventory outside of product.
    await product.save()
  }

  try {
    const doc = await order.save();
    const user = await User.findById(order.user)
    let sustainabilityProductIds = [];

    // Update user's purchase_history with product_id strings (not ObjectIds)
    try {
      const productIds = Array.isArray(order.items)
        ? Array.from(new Set(
          order.items
            .map((it) => {
              const p = it?.product || {};
              // Prefer explicit product_id field if present; otherwise try to read from DB
              return p.product_id || null;
            })
            .filter(Boolean)
            .map(String)
        ))
        : [];

      // If some items lack product_id on the embedded product, fetch them quickly
      if (Array.isArray(order.items)) {
        const missingIdx = order.items
          .map((it, idx) => (!it?.product?.product_id ? idx : -1))
          .filter((idx) => idx !== -1);
        if (missingIdx.length) {
          const rawIds = Array.from(new Set(
            missingIdx
              .map((idx) => order.items[idx]?.product?.id || order.items[idx]?.product?._id)
              .filter(Boolean)
              .map(String)
          ));

          if (rawIds.length) {
            const objectIds = [];
            const externalIds = [];
            for (const raw of rawIds) {
              if (mongoose.Types.ObjectId.isValid(raw) && raw.length === 24) {
                objectIds.push(new mongoose.Types.ObjectId(raw));
              } else {
                externalIds.push(raw);
              }
            }

            const lookups = [];
            if (objectIds.length) {
              lookups.push(Product.find({ _id: { $in: objectIds } }).select('product_id _id').lean());
            }
            if (externalIds.length) {
              lookups.push(Product.find({ product_id: { $in: externalIds } }).select('product_id _id').lean());
            }

            const results = (await Promise.all(lookups)).flat();
            const map = new Map();
            for (const p of results) {
              const prodId = p?.product_id ? String(p.product_id) : null;
              if (!prodId) continue;
              if (p?._id) {
                map.set(String(p._id), prodId);
              }
              map.set(prodId, prodId);
            }

            for (const idx of missingIdx) {
              const raw = order.items[idx]?.product?.id || order.items[idx]?.product?._id;
              const pid = map.get(String(raw));
              if (pid) productIds.push(pid);
            }
          }
        }
      }

      const unique = Array.from(new Set(productIds.filter(Boolean)));
      if (unique.length) {
        sustainabilityProductIds = unique;
        await User.findByIdAndUpdate(order.user, {
          $addToSet: { purchase_history: { $each: unique } },
        });
      }
    } catch (e) {
      console.error('[orders] Failed to update purchase_history:', e?.message || e);
    }
    // we can use await for this also 
    sendMail({ to: user.email, html: invoiceTemplate(order), subject: 'Order Received' })

    if (sustainabilityProductIds.length) {
      try {
        await syncUserSustainability(order.user, sustainabilityProductIds);
      } catch (err) {
        console.error('[orders] Failed to sync sustainability profile:', err?.message || err);
      }
    }

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllOrders = async (req, res) => {
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let query = Order.find({ deleted: { $ne: true } });
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });


  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  const totalDocs = await totalOrdersQuery.count().exec();
  console.log({ totalDocs });

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    res.set('X-Total-Count', totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};
