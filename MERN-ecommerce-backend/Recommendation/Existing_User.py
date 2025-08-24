import numpy as np
import pandas as pd
# from workable_data import workable_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from workable_data import workable_dataset

# user_profile = {
#     "search_history": ["vegan soap", "eco toothpaste"],
#     "purchase_history": ["GEN0", "GEN1"],
#     "weights": {
#         "carbon": 0.4,
#         "water": 0.3,
#         "rating": 0.3
#     },
#     "price_tolerance": 0.2
# }

# search_history = user_profile["search_history"]
# purchase_history = user_profile["purchase_history"]
# weights = user_profile["weights"]
# price_tolerance = user_profile["price_tolerance"]

# water_grade_to_score = {
#     "A+": 5,
#     "A": 4,
#     "B": 3,
#     "C": 2,
#     "D": 1,
#     "Unknown": 0
# }

# carbon_grade_to_score = {
#     "A+": 5,
#     "A": 4,
#     "B": 3,
#     "C": 2,
#     "D": 1,
#     "Unknown": 0
# }

# def form_vectorizer_tag_vectors(df):
#     df["Tags"] = df["Tags"].fillna("")
#     vectorizer = TfidfVectorizer(stop_words='english')
#     tag_vectors = vectorizer.fit_transform(df["Tags"])
#     return vectorizer, tag_vectors

# def calculate_product_score(row, weights):
#     return (
#         weights["rating"] * row["rating"] +
#         weights["eco"] * carbon_grade_to_score[row["Eco_Rating"]] +
#         weights["water"] * water_grade_to_score[row["Water_Rating"]]
#     )


# def get_user_avg_price(purchased_df, df):
#     return purchased_df['Sale Price'].mean() if not purchased_df.empty else None

#  # --- 1. Recommendations from Search History ---
# def from_search_history(df):
#     scored_products = pd.DataFrame()
#     for query in search_history:
#         query_vec = vectorizer.transform([query])
#         sim_scores = cosine_similarity(query_vec, tag_vectors).flatten()
#         df_copy = df.copy()
#         df_copy["similarity"] = sim_scores
#         df_copy = df_copy[df_copy["similarity"] > 0]

#         df_copy["sustainability_score"] = df_copy.apply(
#             lambda row: calculate_product_score(row, weights), axis=1
#         )

#         df_copy["final_score"] = (
#             0.6 * df_copy["similarity"] + 0.4 * (df_copy["sustainability_score"] / 5)
#         )
#         scored_products = pd.concat([scored_products, df_copy], ignore_index=True)
#     return scored_products

#  # --- 2. Recommendations from Purchase History ---
# def from_purchase_history(df, purchased_categories, avg_purchase_price):
#     df_copy = df.copy()
#     df_copy["similarity"] = 0  # No query similarity, but we’ll use sustainability

#     # Filter by similar categories (avoid recommending exact same item)
#     if purchased_categories:
#         df_copy = df_copy[df_copy["Category"].isin(purchased_categories)]

#     # Filter by price range
#     if avg_purchase_price:
#         min_price = avg_purchase_price * (1 - price_tolerance)
#         max_price = avg_purchase_price * (1 + price_tolerance)
#         df_copy = df_copy[(df_copy["Sale Price"] >= min_price) & (df_copy["Sale Price"] <= max_price)]

#     # Calculate sustainability score and final score
#     df_copy["sustainability_score"] = df_copy.apply(
#         lambda row: calculate_product_score(row, weights), axis=1
#     )
#     df_copy["final_score"] = (df_copy["sustainability_score"] / 5)

#     return df_copy

# def remove_similar_items(df, purchased_names, threshold=0.8):
#     name_vecs = vectorizer.transform(df["Product Name"])
#     purchased_vecs = vectorizer.transform(purchased_names)
#     sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
    
#     # Find max similarity with any purchased item
#     max_sim = sim_matrix.max(axis=1)
#     return df[max_sim < threshold]

# def home_page_recommendations(df, top_k=10):
#     """
#     Recommends products for an existing user using both search and purchase history.
#     """


#     purchased_df = df[df["Item Number"].isin(purchase_history)]
#     avg_purchase_price = get_user_avg_price(purchased_df, df)    
#     purchased_categories = set(purchased_df["Category"])
#     purchased_names = purchased_df["Product Name"]
   
#     # --- 3. Combine Both Recommendation Sources ---
#     search_recs = from_search_history(df, search_history)
#     purchase_recs = from_purchase_history(df, purchased_categories, avg_purchase_price)

#     combined = pd.concat([search_recs, purchase_recs], ignore_index=True)

#     # Remove already purchased products
#     combined = combined[~combined["Item Number"].isin(purchase_history)]
#     combined = remove_similar_items(combined, purchased_names)

#     # Remove duplicates by item_number, keep max final_score
#     combined = combined.groupby("Item Number").agg({
#         "Product Name": "first",
#         "Category": "first",
#         "Sale Price": "first",
#         "similarity": "max",
#         "sustainability_score": "mean",
#         "final_score": "max",
#         "Tags": "first"
#     }).reset_index()

#     # Sort and return top K
#     return combined.sort_values("final_score", ascending=False)["product_id"].head(top_k)

# def search_based_recommendation(query, df):
#     weights = user_profile["weights"]
#     purchase_history = user_profile["purchase_history"]
#     price_tolerance = user_profile["price_tolerance"]
    
#     # --- Step 1: Vectorize the query ---
#     query_vec = vectorizer.transform([query])
    
    
#     # --- Step 2: Compute cosine similarity between query and tag_vectors ---
#     similarities = cosine_similarity(query_vec, tag_vectors).flatten()
#     df_copy = df.copy()
#     df_copy["similarity"] = similarities
    
#     # --- Step 3: Filter based on price tolerance ---
#     # if purchase_history:
#     #     purchased_df = df[df["Item Number"].isin(purchase_history)]
#     #     avg_price = get_user_avg_price(purchased_df, df)
#     #     print(avg_price)
#     #     if avg_price:
#     #         min_price = avg_price * (1 - price_tolerance)
#     #         max_price = avg_price * (1 + price_tolerance)
#     #         df_copy = df_copy[(df_copy["Sale Price"] >= min_price) & (df_copy["Sale Price"] <= max_price)]
#     # print(df_copy.shape)
    
#      # --- Step 4: Compute sustainability score ---
#     df_copy["sustainability_score"] = df_copy.apply(
#         lambda row: calculate_product_score(row, weights), axis=1
#     )

#     # --- Step 5: Final score (combine both) ---
#     df_copy["final_score"] = (
#         0.6 * df_copy["similarity"] + 
#         0.4 * (df_copy["sustainability_score"] / 5)
#     )

#     # --- Step 6: Remove already purchased or similar items ---
#     # purchased_names = df[df["Item Number"].isin(purchase_history)]["Product Name"].tolist()
#     # if purchased_names:
#     #     name_vecs = vectorizer.transform(df_copy["Product Name"])
#     #     purchased_vecs = vectorizer.transform(purchased_names)
#     #     sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
#     #     max_sim = sim_matrix.max(axis=1)
#     #     df_copy = df_copy[max_sim < similarity_threshold]

#     # --- Step 7: Return Top K Recommendations ---
#     df_copy = df_copy.sort_values("final_score", ascending=False)
#     return df_copy["product_id"]


# def get_better_products_in_price_range(price_alts, item_price, tolerance):
#     min_price = item_price * (1 - tolerance)
#     max_price = item_price * (1 + tolerance)
#     price_alts = price_alts[(price_alts["Sale Price"] >= min_price) & (price_alts["Sale Price"] <= max_price)]
#     return price_alts

# def cart_alternatives(cart_items, df, top_k=10):
#     # Step 1: Compute sustainability scores for all products
#     df_copy = df.copy()
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

#     for item in cart_items:
        
#         item_number=item["Item Number"]
        
#         if item_number not in df["Item Number"].values:
#             continue

#         df_cart_item = df[df["Item Number"] == item_number].iloc[0]
#         item_name = df_cart_item["Product Name"]
#         item_number = df_cart_item["Item Number"]
#         item_category = df_cart_item.get("Category", "")
#         item_price = df_cart_item.get("Sale Price", 0)
#         item_score = calculate_product_score(df_cart_item, weights)

#         better_alts = df_copy[
#             (df_copy["sustainability_score"] >= item_score) &
#             (df_copy["Item Number"] != item_number)
#         ].copy()

#         tolerance = price_tolerance
#         while tolerance <= 0.5:  # or set max limit
#             better_alts = get_better_products_in_price_range(better_alts, item_price, tolerance)
#             if len(better_alts) >= top_k:
#                 break
#             tolerance += 0.05  # increment step

#         if better_alts.empty:
#             continue

#         # Step 4: Compute name similarity
#         item_vec = vectorizer.transform([item_name])
#         alt_vecs = vectorizer.transform(better_alts["Product Name"].fillna(""))
#         name_similarity = cosine_similarity(alt_vecs, item_vec).flatten()

#         # Step 5: Category similarity
#         category_score = better_alts["Category"].apply(
#             lambda c: 1.0 if c == item_category else 0.5 if item_category in str(c) or str(c) in item_category else 0.0
#         )
        
#         # Step 6: Normalize sustainability score [0,1]
#         sustainability_scaled = better_alts["sustainability_score"] / 5

#         # Step 7: Compute final score with weighted factors
#         better_alts["name_similarity"] = name_similarity
#         better_alts["category_score"] = category_score
#         better_alts["sustainability_scaled"] = sustainability_scaled
#         better_alts["final_score"] = (
#             0.5 * better_alts["name_similarity"] +
#             0.2 * better_alts["category_score"] +
#             0.3 * better_alts["sustainability_scaled"]
#         )

#         # Step 8: Sort and select
#         better_alts = better_alts.sort_values(by="final_score", ascending=False)

#         # Tag original item for traceability
#         better_alts["original_item"] = item_name

#         # If single product in cart → recommend all better
#         if len(cart_items) == 1:
#             recommendations.append(better_alts)
#         else:
#             recommendations.append(better_alts.head(top_k))

#     # Final concatenated DataFrame
#     if recommendations:
#         return recommendations["product_id"]
#     else:
#         return pd.DataFrame(columns=[
#             "original_item", "Product Name", "Category", "Sale Price", 
#             "sustainability_score", "name_similarity", "category_score", 
#             "sustainability_scaled", "final_score"
#         ])


# def main():

#     df_products = workable_dataset

#     global vectorizer, tag_vectors
#     vectorizer, tag_vectors = form_vectorizer_tag_vectors(df_products)
#     recs = home_page_recommendations(df_products, top_k=10)
#     home_page_recommends= recs

#     query = "organic soap"
#     search_recommendations = search_based_recommendation(query, df_products, top_k=10)

#     cart_items = [{"ioadfoia"}]
#     alternatives_recommendations = cart_alternatives(cart_items, df_products, user_profile)



# if __name__ == "__main__":
#     main()

print(workable_dataset.info())