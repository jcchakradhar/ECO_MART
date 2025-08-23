import pandas as pd
from common_code import calculate_product_score, vectorizer, tag_vectors, get_user_avg_price
from sklearn.metrics.pairwise import cosine_similarity
from common_code import search_history, purchase_history, weights, price_tolerance
from common_code import remove_similar_items
from common_code import user_profile


def search_based_recommendation(query, df):
    weights = user_profile["weights"]
    purchase_history = user_profile["purchase_history"]
    price_tolerance = user_profile["price_tolerance"]
    
    # --- Step 1: Vectorize the query ---
    query_vec = vectorizer.transform([query])
    
    
    # --- Step 2: Compute cosine similarity between query and tag_vectors ---
    similarities = cosine_similarity(query_vec, tag_vectors).flatten()
    df_copy = df.copy()
    df_copy["similarity"] = similarities
    
    # --- Step 3: Filter based on price tolerance ---
    # if purchase_history:
    #     purchased_df = df[df["Item Number"].isin(purchase_history)]
    #     avg_price = get_user_avg_price(purchased_df, df)
    #     print(avg_price)
    #     if avg_price:
    #         min_price = avg_price * (1 - price_tolerance)
    #         max_price = avg_price * (1 + price_tolerance)
    #         df_copy = df_copy[(df_copy["Sale Price"] >= min_price) & (df_copy["Sale Price"] <= max_price)]
    # print(df_copy.shape)
    
     # --- Step 4: Compute sustainability score ---
    df_copy["sustainability_score"] = df_copy.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )

    # --- Step 5: Final score (combine both) ---
    df_copy["final_score"] = (
        0.6 * df_copy["similarity"] + 
        0.4 * (df_copy["sustainability_score"] / 5)
    )

    # --- Step 6: Remove already purchased or similar items ---
    # purchased_names = df[df["Item Number"].isin(purchase_history)]["Product Name"].tolist()
    # if purchased_names:
    #     name_vecs = vectorizer.transform(df_copy["Product Name"])
    #     purchased_vecs = vectorizer.transform(purchased_names)
    #     sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
    #     max_sim = sim_matrix.max(axis=1)
    #     df_copy = df_copy[max_sim < similarity_threshold]

    # --- Step 7: Return Top K Recommendations ---
    df_copy = df_copy.sort_values("final_score", ascending=False)
    return df_copy["product_id"]