const { Category } = require('../model/Category');
const { User } = require('../model/User');

exports.fetchUserById = async (req, res) => {
  const { id } = req.user;
  console.log(id)
  try {
    const user = await User.findById(id);
    res.status(200).json({
      id: user.id,
      name: user.name,
      addresses: user.addresses,
      email: user.email,
      role: user.role,
      // sustainability fields
      searchHistory: user.searchHistory,
      purchase_history: user.purchase_history,
      weights: user.weights,
      price_tolerance: user.price_tolerance,
      eco_score: user.eco_score,
      water_score: user.water_score,
      carbon_saved: user.carbon_saved,
      water_saved: user.water_saved,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
};
