import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from workable_data import workable_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

# def calculate_product_score(row, weights):
#     return (
#         weights["rating"] * row["rating"] +
#         weights["eco"] * carbon_grade_to_score[row["Eco_Rating"]] +
#         weights["water"] * water_grade_to_score[row["Water_Rating"]]
#     )

# def home_page(df,weights):
#     df_products = df.copy()
#     df_products["score"] = df_products.apply(calculate_product_score, axis=1,weights=weights)
#     new_user_recommended = df_products.sort_values("score", ascending=False)
#     return new_user_recommended["product_id"]


# def form_vectorizer_tag_vectors(df):
#     df["Tags"] = df["Tags"].fillna("")
#     vectorizer = TfidfVectorizer(stop_words='english')
#     tag_vectors = vectorizer.fit_transform(df["Tags"])
#     return vectorizer, tag_vectors

# def recommend_for_search_query(query, df, weights):
#     # Step 1: Transform the query into vector
#     vectorizer, tag_vectors = form_vectorizer_tag_vectors(df)
#     query_vec = vectorizer.transform([query])
#     sim_scores = cosine_similarity(query_vec, tag_vectors).flatten()

#     # Step 2: Add similarity score to df
#     df = df.copy()
#     df["similarity"] = sim_scores

#     # Step 3: Filter top similar items
#     top_similar = df[df["similarity"] > 0].copy()

#     # Step 4: Calculate sustainability-aware product score
#     top_similar["sustainability_score"] = top_similar.apply(
#         lambda row: calculate_product_score(row, weights), axis=1
#     )

#     # Step 5: Final combined score (weighted average of both)
#     # You can change the weight for similarity vs sustainability here
#     top_similar["final_score"] = (
#         0.5 * top_similar["similarity"] + 0.5 * (top_similar["sustainability_score"] / 5)
#     )

#     # Step 6: Return sorted recommendations
#     return top_similar.sort_values("final_score", ascending=False)


# def search_query_recommendations(query, df, weights):
#     df_products = df.copy()

#     recommendations = recommend_for_search_query(query, df_products, weights)
#     return recommendations["product_id"]

# def recommend_alternatives_from_cart(cart_items, df, weights, price_tolerance=0.2, top_k=10):
#     """
#     Recommend alternative items based on what's in the cart.
    
#     Args:
#     - cart_items: list of item_numbers (products in the cart)
#     - df: full product dataframe
#     - weights: dict of weights for rating, eco, water
#     - price_tolerance: float (20% range by default)
#     - top_k: number of recommendations
    
#     Returns:
#     - Top recommended products as DataFrame
#     """
#     alt_candidates = pd.DataFrame()
    
#     for item_id in cart_items:
#         # 1. Get current cart product
#         if item_id not in df["Item Number"].values:
#             continue
        
#         vectorizer, tag_vectors = form_vectorizer_tag_vectors(df)

#         item = df[df["Item Number"] == item_id].iloc[0]
#         item_tag_vector = vectorizer.transform([item["Tags"]])
#         item_price = item["Sale Price"]

#         # 2. Compute cosine similarity with all products
#         similarity_scores = cosine_similarity(item_tag_vector, tag_vectors).flatten()

#         df["similarity"] = similarity_scores

#         # 3. Filter candidates (exclude current item)
#         candidates = df[df["Item Number"] != item_id].copy()

#         # 4. Filter by price range
#         lower = item_price * (1 - price_tolerance)
#         upper = item_price * (1 + price_tolerance)
#         candidates = candidates[(candidates["Sale Price"] >= lower) & (candidates["Sale Price"] <= upper)]

#         # 5. Compute sustainability score
#         candidates["sustainability_score"] = candidates.apply(
#             lambda row: calculate_product_score(row, weights), axis=1
#         )

#         # 6. Compute final score
#         candidates["final_score"] = (
#             0.4 * candidates["similarity"] +
#             0.6 * (candidates["sustainability_score"] / 5)
#         )

#         alt_candidates = pd.concat([alt_candidates, candidates], ignore_index=True)

#     # 7. Remove duplicates, rank by score
#     alt_candidates = alt_candidates.drop_duplicates(subset="Item Number")
#     return alt_candidates.sort_values("final_score", ascending=False).head(top_k)



# def main():
#     df_prod = workable_dataset

#     #weights for new user recommendations should be extracted from personalized data
#     weights = {"rating": 0.4, "eco": 0.3, "water":0.3}

#     #Home Page Recommendations
#     new_user_home_page = home_page(df_prod,weights)

#     query = "organic shampoo"
#     search_recommendations = search_query_recommendations(query, df_prod, weights)

#     cart_items = ["GEN0", "GEN1"]
#     price_tolerance=0.2

#     #I have to change the code to which give recommendations for each product in the cart
#     alternatives_cart = recommend_alternatives_from_cart(cart_items, df_prod, weights, price_tolerance)


# if __name__ == "__main__":
#     main()


