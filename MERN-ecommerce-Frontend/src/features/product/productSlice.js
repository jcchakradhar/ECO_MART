import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchProductsByFilters,
  fetchBrands,
  fetchCategories,
  fetchProductById,
  createProduct,
  updateProduct,
  fetchHomeRecommendationsAPI,
} from './productAPI';
// No auth coupling needed for session-cached recommendations

// Hydrate recommendations from sessionStorage (per browser session)
const loadSessionRecs = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem('homeRecsV1');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) { }
  return null;
};
const sessionRecs = loadSessionRecs();

const initialState = {
  products: [],
  brands: [],
  categories: [],
  status: 'idle',
  totalItems: 0,
  selectedProduct: null,
  // recommendations for Home page
  recommended: Array.isArray(sessionRecs?.data) ? sessionRecs.data : [],
  recommendedStatus: 'idle',
  recommendedFetchedForSession: !!(sessionRecs && Array.isArray(sessionRecs.data)),
};


export const fetchProductByIdAsync = createAsyncThunk(
  'product/fetchProductById',
  async (id) => {
    const response = await fetchProductById(id);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const fetchProductsByFiltersAsync = createAsyncThunk(
  'product/fetchProductsByFilters',
  async ({ filter, sort, pagination, admin }) => {
    const response = await fetchProductsByFilters(filter, sort, pagination, admin);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

// Fetch recommendations once per login session and resolve to product details
export const fetchHomeRecommendationsAsync = createAsyncThunk(
  'product/fetchHomeRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const recResp = await fetchHomeRecommendationsAPI();
      const ids = Array.isArray(recResp.data) ? recResp.data : [];
      // Resolve product docs; backend GET /products/:id returns a product
      const details = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fetchProductById(id);
            return r.data;
          } catch {
            return null;
          }
        })
      );
      return details.filter(Boolean);
    } catch (e) {
      return rejectWithValue(e?.message || 'failed');
    }
  }
);

export const fetchBrandsAsync = createAsyncThunk(
  'product/fetchBrands',
  async () => {
    const response = await fetchBrands();
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);
export const fetchCategoriesAsync = createAsyncThunk(
  'product/fetchCategories',
  async () => {
    const response = await fetchCategories();
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const createProductAsync = createAsyncThunk(
  'product/create',
  async (product) => {
    const response = await createProduct(product);
    return response.data;
  }
);

export const updateProductAsync = createAsyncThunk(
  'product/update',
  async (update) => {
    const response = await updateProduct(update);
    return response.data;
  }
);

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Products list
      .addCase(fetchProductsByFiltersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductsByFiltersAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
      })
      // Home recommendations
      .addCase(fetchHomeRecommendationsAsync.pending, (state) => {
        state.recommendedStatus = 'loading';
        // Prevent duplicate calls during StrictMode double-invoke or quick remounts
        state.recommendedFetchedForSession = true;
      })
      .addCase(fetchHomeRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendedStatus = 'idle';
        state.recommended = action.payload || [];
        state.recommendedFetchedForSession = true;
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('homeRecsV1', JSON.stringify({ data: state.recommended }));
          }
        } catch (e) { }
      })
      .addCase(fetchHomeRecommendationsAsync.rejected, (state) => {
        state.recommendedStatus = 'idle';
        state.recommended = [];
        state.recommendedFetchedForSession = true;
      })
      // Brands/Categories
      .addCase(fetchBrandsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBrandsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.brands = action.payload;
      })
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.categories = action.payload;
      })
      // Product details create/update
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.selectedProduct = action.payload;
      })
      .addCase(createProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.products.push(action.payload);
      })
      .addCase(updateProductAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        const index = state.products.findIndex((product) => product.id === action.payload.id);
        state.products[index] = action.payload;
        state.selectedProduct = action.payload;
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;

export const selectAllProducts = (state) => state.product.products;
export const selectBrands = (state) => state.product.brands;
export const selectCategories = (state) => state.product.categories;
export const selectProductById = (state) => state.product.selectedProduct;
export const selectProductListStatus = (state) => state.product.status;

export const selectTotalItems = (state) => state.product.totalItems;
export const selectRecommendedProducts = (state) => state.product.recommended;
export const selectRecommendedFetchedForSession = (state) => state.product.recommendedFetchedForSession;

export default productSlice.reducer;
