from common_code import calculate_product_score, form_vectorizer_tag_vectors
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from common_code import vectorizer, tag_vectors
from common_code import search_history, purchase_history, weights, price_tolerance

def recommend_alternatives_from_cart(item_id, df, weights, price_tolerance=0.2, top_k=10):
    """
    Recommend alternative items based on what's in the cart.
    
    Args:
    - cart_items: list of item_numbers (products in the cart)
    - df: full product dataframe
    - weights: dict of weights for rating, eco, water
    - price_tolerance: float (20% range by default)
    - top_k: number of recommendations
    
    Returns:
    - Top recommended products as DataFrame
    """
    alt_candidates = pd.DataFrame()
    
    # 1. Get current cart product
    if item_id not in df["product_id"].values:
        return None

    item = df[df["product_id"] == item_id].iloc[0]
    item_tag_vector = vectorizer.transform([item["Tags"]])
    item_price = item["price"]

    # 2. Compute cosine similarity with all products
    similarity_scores = cosine_similarity(item_tag_vector, tag_vectors).flatten()

    df["similarity"] = similarity_scores

    # 3. Filter candidates (exclude current item)
    candidates = df[df["product_id"] != item_id].copy()

    # 4. Filter by price range
    lower = item_price * (1 - price_tolerance)
    upper = item_price * (1 + price_tolerance)
    candidates = candidates[(candidates["price"] >= lower) & (candidates["price"] <= upper)]

    # 5. Compute sustainability score
    candidates["sustainability_score"] = candidates.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )

    # 6. Compute final score
    candidates["final_score"] = (
        0.5 * candidates["similarity"] +
        0.5 * (candidates["sustainability_score"] / 5)
    )

    alt_candidates = pd.concat([alt_candidates, candidates], ignore_index=True)

    # 7. Remove duplicates, rank by score
    alt_candidates = alt_candidates.drop_duplicates(subset="product_id")
    return alt_candidates.sort_values("final_score", ascending=False)["_id"].head(top_k)