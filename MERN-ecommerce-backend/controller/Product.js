const { Product } = require('../model/Product');

exports.createProduct = async (req, res) => {
  // this product we have to get from API body
  const product = new Product(req.body);
  product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllProducts = async (req, res) => {
  // Build the complete condition object first
  let condition = {};
  
  // Don't show deleted products (unless admin)
  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }

  // Case-insensitive category filter with space/hyphen handling
  if (req.query.category) {
    const searchTerms = req.query.category.split(',');
    const categoryConditions = [];
    
    for (const term of searchTerms) {
      // Add the original term (case-insensitive)
      categoryConditions.push(new RegExp(`^${term}$`, 'i'));
      
      // Convert hyphenated to spaced version (phone-case -> Phone Case)
      const spacedVersion = term.replace(/-/g, ' ');
      if (spacedVersion !== term) {
        categoryConditions.push(new RegExp(`^${spacedVersion}$`, 'i'));
      }
      
      // Convert spaced to hyphenated version (Phone Case -> phone-case)
      const hyphenatedVersion = term.replace(/\s+/g, '-');
      if (hyphenatedVersion !== term) {
        categoryConditions.push(new RegExp(`^${hyphenatedVersion}$`, 'i'));
      }
    }
    
    condition.category = { $in: categoryConditions };
  }

  // Case-insensitive brand filter with space/hyphen handling
  if (req.query.brand) {
    const searchTerms = req.query.brand.split(',');
    const brandConditions = [];
    
    for (const term of searchTerms) {
      // Add the original term (case-insensitive)
      brandConditions.push(new RegExp(`^${term}$`, 'i'));
      
      // Convert hyphenated to spaced version
      const spacedVersion = term.replace(/-/g, ' ');
      if (spacedVersion !== term) {
        brandConditions.push(new RegExp(`^${spacedVersion}$`, 'i'));
      }
      
      // Convert spaced to hyphenated version
      const hyphenatedVersion = term.replace(/\s+/g, '-');
      if (hyphenatedVersion !== term) {
        brandConditions.push(new RegExp(`^${hyphenatedVersion}$`, 'i'));
      }
    }
    
    condition.brand = { $in: brandConditions };
  }

  console.log('MongoDB condition:', condition);

  // Create queries with the complete condition
  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  // Handle sorting
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  // Get total count
  const totalDocs = await totalProductsQuery.countDocuments();
  console.log('Total products found:', totalDocs);

  // Handle pagination
  if (req.query._page && req.query._limit) {
    const pageSize = parseInt(req.query._limit);
    const page = parseInt(req.query._page);
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    const docs = await query.exec();
    console.log('Products returned:', docs.length);
    res.set('X-Total-Count', totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(400).json(err);
  }
};

exports.fetchProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {new:true});
    product.discountPrice = Math.round(product.price*(1-product.discountPercentage/100))
    const updatedProduct = await product.save()
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
};
