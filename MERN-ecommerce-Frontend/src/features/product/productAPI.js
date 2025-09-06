
export function fetchProductById(id) {
  return new Promise(async (resolve) => {
    const response = await fetch('/products/' + id);
    const data = await response.json();
    resolve({ data });
  });
}

export function createProduct(product) {
  return new Promise(async (resolve) => {
    const response = await fetch('/products/', {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { 'content-type': 'application/json' },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updateProduct(update) {
  return new Promise(async (resolve) => {
    const response = await fetch(
      '/products/' + update.id,
      {
        method: 'PATCH',
        body: JSON.stringify(update),
        headers: { 'content-type': 'application/json' },
      }
    );
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchProductsByFilters(filter, sort, pagination, admin) {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}

  const params = new URLSearchParams();
  for (const key in filter) {
    const values = filter[key];
    if (Array.isArray(values)) {
      // Backend expects comma-separated list (e.g., brand=a,b); URLSearchParams will encode
      if (values.length) params.set(key, values.join(','));
    } else if (values !== undefined && values !== null) {
      params.set(key, String(values));
    }
  }
  for (const key in sort) {
    if (sort[key] !== undefined) params.set(key, String(sort[key]));
  }
  for (const key in pagination) {
    if (pagination[key] !== undefined) params.set(key, String(pagination[key]));
  }
  if (admin) {
    params.set('admin', 'true');
  }

  return new Promise(async (resolve) => {
    const response = await fetch('/products?' + params.toString(), {
      credentials: 'include',
    });
    const data = await response.json();
    const totalItems = await response.headers.get('X-Total-Count');
    resolve({ data: { products: data, totalItems: +totalItems } });
  });
}

export function fetchCategories() {
  return new Promise(async (resolve) => {
    const response = await fetch('/categories');
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchBrands() {
  return new Promise(async (resolve) => {
    const response = await fetch('/brands');
    const data = await response.json();
    resolve({ data });
  });
}

// Fetch recommended product IDs for the Home page from the Python recommendations service
export function fetchHomeRecommendationsAPI() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/recommendations/home', {
        method: 'GET',
        credentials: 'include',
      });
      // Allow non-200s to be handled as empty gracefully
      const data = await response.json().catch(() => []);
      resolve({ data });
    } catch (err) {
      resolve({ data: [] });
    }
  });
}

// Fetch recommended product IDs for search queries from the Python recommendations service
export function fetchSearchRecommendationsAPI(query) {
  return new Promise(async (resolve) => {
    try {
      const url = new URL('http://127.0.0.1:5001/api/recommendations/search');
      url.search = new URLSearchParams({ query }).toString();
      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json().catch(() => []);
      resolve({ data });
    } catch (err) {
      resolve({ data: [] });
    }
  });
}
