import pandas as pd
from .common_code import calculate_product_score, vectorizer, tag_vectors, get_user_avg_price
from sklearn.metrics.pairwise import cosine_similarity
# from .common_code import search_history, purchase_history, weights, price_tolerance
from .common_code import remove_similar_items
# from .common_code import user_profile
from sklearn.feature_extraction.text import TfidfVectorizer


def get_better_products_in_price_range(price_alts, item_price, tolerance):
    min_price = item_price * (1 - tolerance)
    max_price = item_price * (1 + tolerance)
    price_alts = price_alts[(price_alts["price"] >= min_price) & (price_alts["price"] <= max_price)]
    return price_alts

# def cart_alternatives(user_profile, item, df, top_k=10):
#     # Step 1: Compute sustainability scores for all products
#     df_copy = df.copy()
#     weights = user_profile["weights"]
#     price_tolerance = user_profile["price_tolerance"]
#     purchase_history = user_profile.get("purchase_history", []) or []
#     search_history = user_profile.get("search_history", []) or []
#     df_copy["sustainability_score"] = df_copy.apply(
#         lambda row: calculate_product_score(row, weights), axis=1
#     )
    
#     # Step 2: Vectorize product names
#     vectorizer = TfidfVectorizer()
#     name_corpus = df_copy["Product Name"].fillna("").astype(str).tolist()
#     vectorizer.fit(name_corpus)
#     # Step 3: Find more sustainable alternatives
#     df_copy["sustainability_score"] = df_copy.apply(
#         lambda row: calculate_product_score(row, weights), axis=1
#     )

#     recommendations = []
        
#     item_number=item["product_id"]
    
#     if item_number not in df["product_id"].values:
#         return None

#     df_cart_item = df[df["product_id"] == item_number].iloc[0]
#     item_name = df_cart_item["title"]
#     item_number = df_cart_item["product_id"]
#     item_category = df_cart_item.get("category_name", "")
#     item_price = df_cart_item.get("price", 0)
#     item_score = calculate_product_score(df_cart_item, weights)

#     better_alts = df_copy[
#         (df_copy["sustainability_score"] >= item_score) &
#         (df_copy["product_id"] != item_number)
#     ].copy()

#     tolerance = price_tolerance
#     while tolerance <= 0.5:  # or set max limit
#         better_alts = get_better_products_in_price_range(better_alts, item_price, tolerance)
#         if len(better_alts) >= top_k:
#             break
#         tolerance += 0.05  # increment step

#     # if better_alts.empty:
#     #     continue

#     # Step 4: Compute name similarity
#     item_vec = vectorizer.transform([item_name])
#     alt_vecs = vectorizer.transform(better_alts["title"].fillna(""))
#     name_similarity = cosine_similarity(alt_vecs, item_vec).flatten()

#     # Step 5: Category similarity
#     category_score = better_alts["category"].apply(
#         lambda c: 1.0 if c == item_category else 0.5 if item_category in str(c) or str(c) in item_category else 0.0
#     )
    
#     # Step 6: Normalize sustainability score [0,1]
#     sustainability_scaled = better_alts["sustainability_score"] / 5

#     # Step 7: Compute final score with weighted factors
#     better_alts["name_similarity"] = name_similarity
#     better_alts["category_score"] = category_score
#     better_alts["sustainability_scaled"] = sustainability_scaled
#     better_alts["final_score"] = (
#         0.5 * better_alts["name_similarity"] +
#         0.2 * better_alts["category_score"] +
#         0.3 * better_alts["sustainability_scaled"]
#     )

#     # Step 8: Sort and select
#     better_alts = better_alts.sort_values(by="final_score", ascending=False)

#     # Tag original item for traceability
#     better_alts["original_item"] = item_name

#     # If single product in cart → recommend all better
#     # if len(cart_items) == 1:
#     #     recommendations.append(better_alts)
#     # else:
#     recommendations.append(better_alts.head(top_k))

#     # Final concatenated DataFrame
#     # if recommendations:
#     return recommendations["_id"]
#     # else:
#     #     return pd.DataFrame(columns=[
#     #         "original_item", "Product Name", "Category", "Sale Price", 
#     #         "sustainability_score", "name_similarity", "category_score", 
#     #         "sustainability_scaled", "final_score"
#     #     ])

# ...existing code...
import pandas as pd
from .common_code import calculate_product_score  # relative import
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId, Binary
from datetime import datetime
import base64


def _to_jsonable(v):
    """Helper: safely convert non-JSON-friendly values."""
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, (bytes, bytearray)):
        return base64.b64encode(v).decode("ascii")
    if isinstance(v, Binary):
        return base64.b64encode(bytes(v)).decode("ascii")
    if isinstance(v, datetime):
        return v.isoformat()
    return v


# def cart_alternatives(profile, item_number, df, top_k=10):
#     """Recommend more sustainable alternatives for a cart item."""

#     if not isinstance(df, pd.DataFrame) or df.empty:
#         return []

#     if not isinstance(item, dict) or "product_id" not in item:
#         return []

#     # --- Step 1: Setup ---
#     weights = (profile or {}).get("weights", {}) if isinstance(profile, dict) else {}
#     price_tolerance = (profile or {}).get("price_tolerance", 0.2)
#     purchase_history = (profile or {}).get("purchase_history", []) or []
#     search_history = (profile or {}).get("search_history", []) or []

#     df_copy = df.copy()

#     # --- Step 2: Sustainability scoring ---
#     try:
#         df_copy["sustainability_score"] = df_copy.apply(
#             lambda row: calculate_product_score(row, weights), axis=1
#         )
#     except Exception:
#         df_copy["sustainability_score"] = 0

#     # --- Step 3: Validate target item ---
#     # item_number = item.get("product_id")
#     item = df[df["product_id"] == item_number].iloc[0]
#     if item_number not in df["product_id"].values:
#         return []

#     df_cart_item = df[df["product_id"] == item_number].iloc[0]
#     item_name = df_cart_item.get("title", "")
#     item_category = df_cart_item.get("category_name", "")
#     item_price = df_cart_item.get("price", 0)
#     item_score = calculate_product_score(df_cart_item, weights)

#     # --- Step 4: Get better sustainability alternatives ---
#     better_alts = df_copy[
#         (df_copy["sustainability_score"] >= item_score) &
#         (df_copy["product_id"] != item_number)
#     ].copy()

#     # Expand tolerance if needed
#     tolerance = price_tolerance
#     while tolerance <= 0.5:
#         better_alts = get_better_products_in_price_range(better_alts, item_price, tolerance)
#         if len(better_alts) >= top_k:
#             break
#         tolerance += 0.05

#     if better_alts.empty:
#         return []

#     # --- Step 5: Compute name similarity ---
#     try:
#         vectorizer = TfidfVectorizer()
#         vectorizer.fit(df_copy["title"].fillna("").astype(str).tolist())
#         item_vec = vectorizer.transform([item_name])
#         alt_vecs = vectorizer.transform(better_alts["title"].fillna("").astype(str))
#         better_alts["name_similarity"] = cosine_similarity(alt_vecs, item_vec).flatten()
#     except Exception:
#         better_alts["name_similarity"] = 0.0

#     # --- Step 6: Category similarity ---
#     better_alts["category_score"] = better_alts["category_name"].apply(
#         lambda c: 1.0 if c == item_category
#         else 0.5 if item_category in str(c) or str(c) in item_category
#         else 0.0
#     )

#     # --- Step 7: Normalize sustainability ---
#     better_alts["sustainability_scaled"] = better_alts["sustainability_score"] / 5

#     # --- Step 8: Final score ---
#     better_alts["final_score"] = (
#         0.5 * better_alts["name_similarity"] +
#         0.2 * better_alts["category_score"] +
#         0.3 * better_alts["sustainability_scaled"]
#     )

#     # --- Step 9: Sort & pick top-k ---
#     better_alts = better_alts.sort_values("final_score", ascending=False).head(top_k)
#     better_alts["original_item"] = item_name

#     id_col = "_id" if "_id" in better_alts.columns else (
#         "product_id" if "product_id" in better_alts.columns else None
#     )
#     if not id_col:
#         return []

#     out_cols = [id_col, "title", "category_name", "price", "sustainability_score", "final_score", "original_item"]
#     out = better_alts[[c for c in out_cols if c in better_alts.columns]]

#     # --- Step 10: JSON-safe return ---
#     return [{k: _to_jsonable(v) for k, v in rec.items()} for rec in out.to_dict(orient="records")]
def cart_alternatives(profile, product_id, df, top_k=10):
    """Recommend more sustainable alternatives for a given product_id."""
    # Validate inputs
    if not isinstance(df, pd.DataFrame) or df.empty:
        return []
    if not product_id or "product_id" not in df.columns:
        return []

    # Normalize for comparison
    product_id = str(product_id)
    df = df.copy()
    df["product_id"] = df["product_id"].astype(str)

    if product_id not in df["product_id"].values:
        return []

    # Profile defaults
    weights = (profile or {}).get("weights", {}) if isinstance(profile, dict) else {}
    price_tolerance = float((profile or {}).get("price_tolerance", 0.2))

    # Compute sustainability score
    try:
        df["sustainability_score"] = df.apply(
            lambda row: calculate_product_score(row, weights), axis=1
        )
    except Exception:
        df["sustainability_score"] = 0.0

    # Target item row
    df_cart_item = df.loc[df["product_id"] == product_id].iloc[0]
    item_name = df_cart_item.get("title", "")
    item_category = df_cart_item.get("category_name", df_cart_item.get("category", ""))
    item_price = float(df_cart_item.get("price", 0) or 0)
    try:
        item_score = float(df_cart_item.get("sustainability_score", 0) or 0)
    except Exception:
        item_score = 0.0

    # Better alternatives
    better_alts = df[
        (df["sustainability_score"] >= item_score) &
        (df["product_id"] != product_id)
    ].copy()

    # Price range widening
    def _within_price_range(frame, center, tol):
        lo, hi = center * (1 - tol), center * (1 + tol)
        return frame[(frame["price"] >= lo) & (frame["price"] <= hi)]

    tol = price_tolerance
    while tol <= 0.5:
        filtered = _within_price_range(better_alts, item_price, tol)
        if len(filtered) >= top_k:
            better_alts = filtered
            break
        tol += 0.05
    if better_alts.empty:
        return []

    # Name similarity
    try:
        vec = TfidfVectorizer()
        vec.fit(df["title"].fillna("").astype(str).tolist())
        item_vec = vec.transform([str(item_name)])
        alt_vecs = vec.transform(better_alts["title"].fillna("").astype(str).tolist())
        better_alts["name_similarity"] = cosine_similarity(alt_vecs, item_vec).flatten()
    except Exception:
        better_alts["name_similarity"] = 0.0

    # Category similarity
    cat_col = "category_name" if "category_name" in better_alts.columns else ("category" if "category" in better_alts.columns else None)
    if cat_col:
        better_alts["category_score"] = better_alts[cat_col].apply(
            lambda c: 1.0 if c == item_category
            else 0.5 if str(item_category) in str(c) or str(c) in str(item_category)
            else 0.0
        )
    else:
        better_alts["category_score"] = 0.0

    # Normalize sustainability (0..1)
    try:
        better_alts["sustainability_scaled"] = better_alts["sustainability_score"] / 5.0
    except Exception:
        better_alts["sustainability_scaled"] = 0.0

    # Final score
    better_alts["final_score"] = (
        0.5 * better_alts["name_similarity"] +
        0.2 * better_alts["category_score"] +
        0.3 * better_alts["sustainability_scaled"]
    )

    # Top-K
    better_alts = better_alts.sort_values("final_score", ascending=False).head(top_k)
    better_alts["original_item"] = item_name

    id_col = "_id" if "_id" in better_alts.columns else ("product_id" if "product_id" in better_alts.columns else None)
    if not id_col:
        return []

#     cols = [id_col, "title", "category_name", "price", "sustainability_score", "final_score", "original_item"]
#     cols = [c for c in cols if c in better_alts.columns]
#     out = better_alts[cols]

#     return [{k: _to_jsonable(v) for k, v in rec.items()} for rec in out.to_dict(orient="records")]

    # Return only the ID column as a JSON-safe list
    ids = better_alts[id_col].tolist()
    return [_to_jsonable(v) for v in ids]
# # ...existing code...