import pandas as pd
from .common_code import calculate_product_score, vectorizer, tag_vectors, get_user_avg_price
from sklearn.metrics.pairwise import cosine_similarity
from .common_code import search_history, purchase_history, weights, price_tolerance
from .common_code import remove_similar_items
from .workable_data import workable_dataset, product_vectorizer, product_vectors, category_vectorizer, category_vectors
# # from common_code import user_profile


# # def search_based_recommendation(user_profile,query, df):
# #     weights = user_profile["weights"]
# #     purchase_history = user_profile["purchase_history"]
# #     price_tolerance = user_profile["price_tolerance"]
    
# #     # --- Step 1: Vectorize the query ---
# #     query_vec = vectorizer.transform([query])
    
    
# #     # --- Step 2: Compute cosine similarity between query and tag_vectors ---
# #     similarities = cosine_similarity(query_vec, tag_vectors).flatten()
# #     df_copy = df.copy()
# #     df_copy["similarity"] = similarities
    
# #     # --- Step 3: Filter based on price tolerance ---
# #     # if purchase_history:
# #     #     purchased_df = df[df["Item Number"].isin(purchase_history)]
# #     #     avg_price = get_user_avg_price(purchased_df, df)
# #     #     print(avg_price)
# #     #     if avg_price:
# #     #         min_price = avg_price * (1 - price_tolerance)
# #     #         max_price = avg_price * (1 + price_tolerance)
# #     #         df_copy = df_copy[(df_copy["Sale Price"] >= min_price) & (df_copy["Sale Price"] <= max_price)]
# #     # print(df_copy.shape)
    
# #      # --- Step 4: Compute sustainability score ---
# #     df_copy["sustainability_score"] = df_copy.apply(
# #         lambda row: calculate_product_score(row, weights), axis=1
# #     )

# #     # --- Step 5: Final score (combine both) ---
# #     df_copy["final_score"] = (
# #         0.6 * df_copy["similarity"] + 
# #         0.4 * (df_copy["sustainability_score"] / 5)
# #     )

# #     # --- Step 6: Remove already purchased or similar items ---
# #     # purchased_names = df[df["Item Number"].isin(purchase_history)]["Product Name"].tolist()
# #     # if purchased_names:
# #     #     name_vecs = vectorizer.transform(df_copy["Product Name"])
# #     #     purchased_vecs = vectorizer.transform(purchased_names)
# #     #     sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
# #     #     max_sim = sim_matrix.max(axis=1)
# #     #     df_copy = df_copy[max_sim < similarity_threshold]

# #     # --- Step 7: Return Top K Recommendations ---
# #     df_copy = df_copy.sort_values("final_score", ascending=False)
# #     return df_copy["_id"]

# # # ...existing code...
# # import pandas as pd
# # from .common_code import calculate_product_score  # ensure relative import

# # def search_based_recommendation(profile, query, df):
# #     q = (query or "").strip()
# #     if not q:
# #         return []

# #     if not isinstance(df, pd.DataFrame) or df.empty:
# #         return []

# #     # Choose available text columns to search
# #     text_cols = [c for c in ['title', 'name', 'product_name', 'description', 'category_name', 'tags']
# #                  if c in df.columns]
# #     if not text_cols:
# #         return []

# #     # Build a boolean mask (avoid “if Series”)
# #     mask = pd.Series(False, index=df.index)
# #     for col in text_cols:
# #         mask = mask | df[col].astype(str).str.contains(q, case=False, na=False)

# #     matches = df.loc[mask].copy()
# #     if matches.empty:
# #         return []

# #     # Optional scoring using user weights; fall back if it fails
# #     try:
# #         weights = (profile or {}).get('weights', {}) if isinstance(profile, dict) else {}
# #         matches['__score'] = matches.apply(lambda row: calculate_product_score(row, weights), axis=1)
# #         matches = matches.sort_values('__score', ascending=False)
# #     except Exception:
# #         if 'price' in matches.columns:
# #             matches = matches.sort_values('price', ascending=True)

# #     # Select output columns and sanitize IDs
# #     id_col = '_id' if '_id' in matches.columns else ('product_id' if 'product_id' in matches.columns else None)
# #     out_cols = [id_col]
# #     out = matches[out_cols].head(20)

# #     from bson import ObjectId, Binary
# #     from datetime import datetime
# #     import base64

# #     def _to_jsonable(v):
# #         if isinstance(v, ObjectId):
# #             return str(v)
# #         if isinstance(v, (bytes, bytearray)):
# #             return base64.b64encode(v).decode('ascii')
# #         if isinstance(v, Binary):
# #             return base64.b64encode(bytes(v)).decode('ascii')
# #         if isinstance(v, datetime):
# #             return v.isoformat()
# #         return v

# #     return [{k: _to_jsonable(v) for k, v in rec.items()} for rec in out.to_dict(orient='records')]
# # # ...existing code...

# # ...existing code...
# import pandas as pd
# from .common_code import calculate_product_score  # relative import
# from sklearn.metrics.pairwise import cosine_similarity
# from bson import ObjectId, Binary
# from datetime import datetime
# import base64


# def _to_jsonable(v):
#     """Helper: safely convert non-JSON-friendly values."""
#     if isinstance(v, ObjectId):
#         return str(v)
#     if isinstance(v, (bytes, bytearray)):
#         return base64.b64encode(v).decode("ascii")
#     if isinstance(v, Binary):
#         return base64.b64encode(bytes(v)).decode("ascii")
#     if isinstance(v, datetime):
#         return v.isoformat()
#     return v


# def search_based_recommendation(profile, query, df):
#     q = (query or "").strip()
#     if not q:
#         return []

#     if not isinstance(df, pd.DataFrame) or df.empty:
#         return []

#     # --- Step 1: Vectorize query ---
#     try:
#         query_vec = vectorizer.transform([q])
#     except Exception as e:
#         return [{"error": f"vectorizer failed: {e}"}]

#     # --- Step 2: Compute cosine similarity ---
#     try:
#         # Step 1: Transform the query into vector
#         query_vec = vectorizer.transform([query])
#         # sim_scores = cosine_similarity(query_vec, tag_vectors).flatten()
        
#         # Step 2: Transform the query using both vectorizers
#         product_vec = product_vectorizer.transform([query])
#         category_vec = category_vectorizer.transform([query])

#         # Step 3: Compute similarities separately
#         sim_product = cosine_similarity(product_vec, product_vectors).flatten()
#         sim_category = cosine_similarity(category_vec, category_vectors).flatten()

#         product_weight = 0.7
#         category_weight = 0.3
#         # Step 4: Weighted similarity
#         sim_scores = product_weight * sim_product + category_weight * sim_category
#     except Exception as e:
#         return [{"error": f"cosine similarity failed: {e}"}]

#     df_copy = df.copy()
#     df_copy["similarity"] = sim_scores

#     # --- Step 3: Price tolerance filter ---
#     weights = (profile or {}).get("weights", {}) if isinstance(profile, dict) else {}
#     # purchase_history = (profile or {}).get("purchase_history", [])
#     # price_tolerance = (profile or {}).get("price_tolerance", 0.2)

#     # if purchase_history:
#     #     purchased_df = df[df["Item Number"].isin(purchase_history)]
#     #     avg_price = get_user_avg_price(purchased_df, df)
#     #     if avg_price:
#     #         min_price, max_price = avg_price * (1 - price_tolerance), avg_price * (1 + price_tolerance)
#     #         df_copy = df_copy[
#     #             (df_copy["Sale Price"] >= min_price) & (df_copy["Sale Price"] <= max_price)
#     #         ]

#     if df_copy.empty:
#         return []

#     # --- Step 4: Sustainability scoring ---
#     try:
#         df_copy["sustainability_score"] = df_copy.apply(
#             lambda row: calculate_product_score(row, weights), axis=1
#         )
#     except Exception:
#         df_copy["sustainability_score"] = 0

#     # --- Step 5: Final score (weighted similarity + sustainability) ---
#     df_copy["final_score"] = (
#         0.6 * df_copy["similarity"] + 0.4 * (df_copy["sustainability_score"] / 5)
#     )

#     # --- Step 6: Remove already purchased or near-duplicates ---
#     # if purchase_history:
#     #     purchased_names = df[df["Item Number"].isin(purchase_history)]["Product Name"].tolist()
#     #     if purchased_names:
#     #         try:
#     #             name_vecs = vectorizer.transform(df_copy["Product Name"])
#     #             purchased_vecs = vectorizer.transform(purchased_names)
#     #             sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
#     #             max_sim = sim_matrix.max(axis=1)
#     #             df_copy = df_copy[max_sim < similarity_threshold]
#     #         except Exception:
#     #             pass

#     if df_copy.empty:
#         return []

#     # --- Step 7: Sort + Select top-k ---
#     # df_copy = df_copy.sort_values("final_score", ascending=False)
#     # id_col = "_id" if "_id" in df_copy.columns else (
#     #     "product_id" if "product_id" in df_copy.columns else None
#     # )

#     # if not id_col:
#     #     return []

#     # out = df_copy[[id_col]].head(20)

#     id_col = "_id" if "_id" in df_copy.columns else (
#         "product_id" if "product_id" in df_copy.columns else None
#     )

#     if not id_col:
#         return []

#     # Collect the desired output columns (if they exist)
#     # out_cols = [id_col]
#     # for col in ["title", "product_id"]:
#     #     if col in df_copy.columns:
#     #         out_cols.append(col)

#     # # Slice dataframe
#     # out = df_copy[out_cols].head(20)

#     # # --- Step 8: Make JSON-serializable ---
#     # return [{k: _to_jsonable(v) for k, v in rec.items()} for rec in out.to_dict(orient="records")]

#     out_ids = df_copy[id_col].head(20).tolist()
#     return [_to_jsonable(v) for v in out_ids]

# import pandas as pd
# from .common_code import calculate_product_score  # ensure relative import

def search_based_recommendation(profile, query, df):
    q = (query or "").strip()
    if not q:
        return []

    if not isinstance(df, pd.DataFrame) or df.empty:
        return []

    # Choose available text columns to search
    text_cols = [c for c in ['title', 'name', 'product_name', 'category_name']
                 if c in df.columns]
    if not text_cols:
        return []

    # Build a boolean mask (avoid “if Series”)
    mask = pd.Series(False, index=df.index)
    for col in text_cols:
        mask = mask | df[col].astype(str).str.contains(q, case=False, na=False)

    matches = df.loc[mask].copy()
    if matches.empty:
        return []

    # Optional scoring using user weights; fall back if it fails
    try:
        weights = (profile or {}).get('weights', {}) if isinstance(profile, dict) else {}
        matches['__score'] = matches.apply(lambda row: calculate_product_score(row, weights), axis=1)
        matches = matches.sort_values('__score', ascending=False)
    except Exception:
        if 'price' in matches.columns:
            matches = matches.sort_values('price', ascending=True)

    # Select output columns and sanitize IDs
    id_col = '_id' if '_id' in matches.columns else ('product_id' if 'product_id' in matches.columns else None)
    # out_cols = [id_col]
    # out = matches[out_cols].head(20)

    from bson import ObjectId, Binary
    from datetime import datetime
    import base64

    def _to_jsonable(v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, (bytes, bytearray)):
            return base64.b64encode(v).decode('ascii')
        if isinstance(v, Binary):
            return base64.b64encode(bytes(v)).decode('ascii')
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    out_ids = matches[id_col].tolist()
    return [_to_jsonable(v) for v in out_ids]
