from common_code import calculate_product_score, form_vectorizer_tag_vectors
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from common_code import vectorizer,tag_vectors
from common_code import search_history, purchase_history, weights, price_tolerance
from common_code import product_vectorizer, category_vectorizer, product_tag_vectors, category_tag_vectors

def recommend_for_search_query(query, df, weights):
    # Step 1: Transform the query into vector
    query_vec = vectorizer.transform([query])
    sim_scores = cosine_similarity(query_vec, tag_vectors).flatten()
    
     # Step 2: Transform the query using both vectorizers
    product_vec = product_vectorizer.transform([query])
    category_vec = category_vectorizer.transform([query])

    # Step 3: Compute similarities separately
    sim_product = cosine_similarity(product_vec, product_tag_vectors).flatten()
    sim_category = cosine_similarity(category_vec, category_tag_vectors).flatten()

    product_weight = 0.7, category_weight = 0.3
    # Step 4: Weighted similarity
    sim_scores = product_weight * sim_product + category_weight * sim_category

    # Step 2: Add similarity score to df
    df = df.copy()
    df["similarity"] = sim_scores

    # Step 3: Filter top similar items
    top_similar = df[df["similarity"] > 0].copy()

    # Step 4: Calculate sustainability-aware product score
    top_similar["sustainability_score"] = top_similar.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )

    # Step 5: Final combined score (weighted average of both)
    # You can change the weight for similarity vs sustainability here
    top_similar["final_score"] = (
        0.6 * top_similar["similarity"] + 0.4 * (top_similar["sustainability_score"] / 5)
    )

    # Step 6: Return sorted recommendations
    return top_similar.sort_values("final_score", ascending=False)


def search_query_recommendations(query, df, weights):
    df_products = df.copy()
    recommendations = recommend_for_search_query(query, df_products, weights)
    return recommendations["_id"]