const { Product } = require('../model/Product');

exports.createProduct = async (req, res) => {
  // this product we have to get from API body
  const product = new Product(req.body);
  product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100))
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

  // Create base queries with the complete condition
  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  // Get total count (before pagination/sorting)
  const totalDocs = await totalProductsQuery.countDocuments();
  console.log('Total products found:', totalDocs);

  // Determine pagination values upfront
  const hasPagination = req.query._page && req.query._limit;
  const pageSize = hasPagination ? parseInt(req.query._limit) : null;
  const page = hasPagination ? parseInt(req.query._page) : null;

  // Robust sorting: when sorting by price, coalesce discountPrice -> price
  const sortField = req.query._sort;
  const sortOrderParam = req.query._order;
  const sortOrder = sortOrderParam === 'desc' ? -1 : 1;

  try {
    // If sorting by price-related field, use aggregation to ensure null-safe ordering
    if (sortField && (sortField === 'discountPrice' || sortField === 'price')) {
      const pipeline = [
        { $match: condition },
        { $addFields: { sortPrice: { $ifNull: ['$discountPrice', '$price'] } } },
        { $sort: { sortPrice: sortOrder, _id: 1 } }, // stable tie-breaker
        // Preserve `id` expected by frontend and drop Mongo `_id`
        { $addFields: { id: '$_id' } },
        { $project: { _id: 0 } }
      ];

      if (hasPagination) {
        pipeline.push({ $skip: pageSize * (page - 1) });
        pipeline.push({ $limit: pageSize });
      }

      const docs = await Product.aggregate(pipeline).exec();
      console.log('Products returned (aggregate):', docs.length);
      res.set('X-Total-Count', totalDocs);
      return res.status(200).json(docs);
    }

    // Sort by Eco/Water ratings using grade ranking A+ > A > B > C > D
    if (sortField && (sortField === 'Eco_Rating' || sortField === 'Water_Rating')) {
      const gradeField = sortField;
      const pipeline = [
        { $match: condition },
        {
          $addFields: {
            gradeRank: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'A+'] }, then: 5 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'A'] }, then: 4 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'B'] }, then: 3 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'C'] }, then: 2 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'D'] }, then: 1 },
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { gradeRank: sortOrder, _id: 1 } },
      ];

      if (hasPagination) {
        pipeline.push({ $skip: pageSize * (page - 1) });
        pipeline.push({ $limit: pageSize });
      }

      pipeline.push({ $addFields: { id: '$_id' } });
      pipeline.push({ $project: { _id: 0 } });

      const docs = await Product.aggregate(pipeline).exec();
      console.log('Products returned (eco/water sort):', docs.length);
      res.set('X-Total-Count', totalDocs);
      return res.status(200).json(docs);
    }

    // Default: simple find with optional sort and pagination
    if (sortField && sortOrderParam) {
      query = query.sort({ [sortField]: sortOrderParam });
    }

    if (hasPagination) {
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }

    const docs = await query.exec();
    console.log('Products returned:', docs.length);
    res.set('X-Total-Count', totalDocs);
    return res.status(200).json(docs);
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(400).json(err);
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
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    product.discountPrice = Math.round(product.price * (1 - product.discountPercentage / 100))
    const updatedProduct = await product.save()
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json(err);
  }
};
// Search products controller

exports.searchProducts = async (req, res) => {
  try {
    // Log 1: See exactly what query parameters are coming from the front-end
    console.log('--- New Search Request ---');
    console.log('Request Query Params:', req.query);

    const searchTerm = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!searchTerm.trim()) {
      console.log('Search term is empty. Sending 400 error.');
      return res.status(400).json({ message: 'Search term is required' });
    }

    const searchQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { material: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Log 2: Check the MongoDB query object we built
    console.log('Constructed MongoDB Query:', JSON.stringify(searchQuery, null, 2));

    const totalResults = await Product.countDocuments(searchQuery);

    // Log 3: See how many documents match the query BEFORE pagination
    console.log(`Found ${totalResults} matching documents in the database.`);

    // Sorting like Home: support _sort and _order (rating or price/discountPrice)
    const sortField = req.query._sort;
    const sortOrderParam = req.query._order;
    const sortOrder = sortOrderParam === 'desc' ? -1 : 1;

    let products;
    if (sortField && (sortField === 'discountPrice' || sortField === 'price')) {
      // Use aggregation to coalesce discountPrice -> price for consistent price sorting
      const pipeline = [
        { $match: searchQuery },
        { $addFields: { sortPrice: { $ifNull: ['$discountPrice', '$price'] } } },
        { $sort: { sortPrice: sortOrder, _id: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $addFields: { id: '$_id' } },
        { $project: { _id: 0 } }
      ];
      products = await Product.aggregate(pipeline).exec();
    } else if (sortField && (sortField === 'Eco_Rating' || sortField === 'Water_Rating')) {
      const gradeField = sortField;
      const pipeline = [
        { $match: searchQuery },
        {
          $addFields: {
            gradeRank: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'A+'] }, then: 5 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'A'] }, then: 4 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'B'] }, then: 3 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'C'] }, then: 2 },
                  { case: { $eq: [{ $toUpper: `$${gradeField}` }, 'D'] }, then: 1 },
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { gradeRank: sortOrder, _id: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $addFields: { id: '$_id' } },
        { $project: { _id: 0 } }
      ];
      products = await Product.aggregate(pipeline).exec();
    } else {
      // Default or rating sort via find()
      let query = Product.find(searchQuery);
      if (sortField && sortOrderParam) {
        query = query.sort({ [sortField]: sortOrderParam });
      }
      products = await query.skip(skip).limit(limit).exec();
    }

    // Log 4: See the final paginated products being sent in the response
    console.log(`Sending ${products.length} products in the response.`);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalResults / limit),
      totalResults
    });

  } catch (error) {
    console.error('❌ Search Controller Error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};