import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ITEMS_PER_PAGE } from '../../app/constants';
import {
  fetchProductsByFilters,
  fetchBrands,
  fetchCategories,
  fetchProductById,
  createProduct,
  updateProduct,
  fetchHomeRecommendationsAPI,
} from './productAPI';

const RECOMMENDATION_MAX_PAGES = 5;

const initialState = {
  products: [],
  brands: [],
  categories: [],
  status: 'idle',
  totalItems: 0,
  selectedProduct: null,
  // recommendations for Home page
  recommended: [],
  recommendedPage: [],
  recommendedStatus: 'idle',
  recommendedFetchedForSession: false,
  showRecommendations: true,
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
// export const fetchHomeRecommendationsAsync = createAsyncThunk(
//   'product/fetchHomeRecommendations',
//   async (_, { rejectWithValue }) => {
//     try {
//       const recResp = await fetchHomeRecommendationsAPI();
//       const ids = Array.isArray(recResp.data) ? recResp.data : [];
//       // Resolve product docs; backend GET /products/:id returns a product
//       const details = await Promise.all(
//         ids.map(async (id) => {
//           try {
//             const r = await fetchProductById(id);
//             return r.data;
//           } catch {
//             return null;
//           }
//         })
//       );
//       return details.filter(Boolean);
//     } catch (e) {
//       return rejectWithValue(e?.message || 'failed');
//     }
//   }
// );
// ...existing code...
export const fetchHomeRecommendationsAsync = createAsyncThunk(
  'product/fetchHomeRecommendations',
  async (userIdArg, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId =
        userIdArg ||
        state.user?.userInfo?.id ||
        state.auth?.loggedInUserToken?.id ||
        state.auth?.loggedInUserToken?._id ||
        null;

      if (!userId) {
        return [];
      }

      const recResp = await fetchHomeRecommendationsAPI(userId);
      const ids = Array.isArray(recResp.data) ? recResp.data : [];
      const maxItems = Math.max(ITEMS_PER_PAGE, ITEMS_PER_PAGE * RECOMMENDATION_MAX_PAGES);
      const limitedIds = ids.slice(0, maxItems);
      const details = await Promise.all(
        limitedIds.map(async (id) => {
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
// ...existing code...

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
    },
    setRecommendedPage: (state, action) => {
      const page = Number(action.payload?.page) || 1;
      const perPage = Number(action.payload?.perPage) || 12;
      const start = (page - 1) * perPage;
      state.recommendedPage = state.recommended.slice(start, start + perPage);
    },
    clearRecommendations: (state) => {
      state.recommended = [];
      state.recommendedPage = [];
      state.recommendedFetchedForSession = false;
    },
    setShowRecommendations: (state, action) => {
      state.showRecommendations = Boolean(action.payload);
    },
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
        state.recommended = [];
        state.recommendedPage = [];
        state.recommendedFetchedForSession = false;
        state.showRecommendations = true;
      })
      .addCase(fetchHomeRecommendationsAsync.fulfilled, (state, action) => {
        state.recommendedStatus = 'idle';
        state.recommended = action.payload || [];
        state.recommendedPage = state.recommended.slice(0, 12);
        state.recommendedFetchedForSession = true;
        state.showRecommendations = true;
      })
      .addCase(fetchHomeRecommendationsAsync.rejected, (state) => {
        state.recommendedStatus = 'idle';
        state.recommended = [];
        state.recommendedPage = [];
        state.recommendedFetchedForSession = true;
        state.showRecommendations = false;
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

export const { clearSelectedProduct, setRecommendedPage, clearRecommendations, setShowRecommendations } = productSlice.actions;

export const selectAllProducts = (state) => state.product.products;
export const selectBrands = (state) => state.product.brands;
export const selectCategories = (state) => state.product.categories;
export const selectProductById = (state) => state.product.selectedProduct;
export const selectProductListStatus = (state) => state.product.status;

export const selectTotalItems = (state) => state.product.totalItems;
export const selectRecommendedProducts = (state) => state.product.recommended;
export const selectRecommendedPage = (state) => state.product.recommendedPage;
export const selectRecommendedStatus = (state) => state.product.recommendedStatus;
export const selectShowRecommendations = (state) => state.product.showRecommendations;
export const selectRecommendationsFetchedForSession = (state) => state.product.recommendedFetchedForSession;

export default productSlice.reducer;
