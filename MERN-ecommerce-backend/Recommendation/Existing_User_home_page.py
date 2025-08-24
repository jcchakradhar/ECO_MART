import pandas as pd
from recommendation.common_code import calculate_product_score, vectorizer, tag_vectors, get_user_avg_price
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from recommendation.common_code import remove_similar_items
from recommendation.workable_data import workable_dataset


def from_search_history(df, search_history, weights):
    scored_products = pd.DataFrame()
    for query in search_history:
        query_vec = vectorizer.transform([query])
        sim_scores = cosine_similarity(query_vec, tag_vectors).flatten()
        df_copy = df.copy()
        df_copy["similarity"] = sim_scores
        df_copy = df_copy[df_copy["similarity"] > 0]

        df_copy["sustainability_score"] = df_copy.apply(
            lambda row: calculate_product_score(row, weights), axis=1
        )

        df_copy["final_score"] = (
            0.6 * df_copy["similarity"] + 0.4 * (df_copy["sustainability_score"] / 5)
        )
        scored_products = pd.concat([scored_products, df_copy], ignore_index=True)
    return scored_products

 # --- 2. Recommendations from Purchase History ---
def from_purchase_history(df, purchased_categories, avg_purchase_price, weights, price_tolerance=0.2):
    df_copy = df.copy()
    df_copy["similarity"] = 0  # No query similarity, but we’ll use sustainability

    # Filter by similar categories (avoid recommending exact same item)
    if purchased_categories:
        df_copy = df_copy[df_copy["category_name"].isin(purchased_categories)]

    # Filter by price range
    if avg_purchase_price:
        min_price = avg_purchase_price * (1 - price_tolerance)
        max_price = avg_purchase_price * (1 + price_tolerance)
        df_copy = df_copy[(df_copy["price"] >= min_price) & (df_copy["price"] <= max_price)]

    # Calculate sustainability score and final score
    df_copy["sustainability_score"] = df_copy.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )
    df_copy["final_score"] = (df_copy["sustainability_score"] / 5)

    return df_copy

def home_page_recommendations(user_profile,df):
    """
    Recommends products for an existing user using both search and purchase history.
    """
    purchase_history = user_profile.get("purchase_history", [])
    search_history = user_profile.get("search_history", [])
    weights = user_profile.get("weights")
    price_tolerance = user_profile.get("price_tolerance", 0.2)
    purchased_df = df[df["product_id"].isin(purchase_history)]
    avg_purchase_price = get_user_avg_price(purchased_df, df)    
    purchased_categories = set(purchased_df["category_name"])
    purchased_names = purchased_df["title"]
   
    # --- 3. Combine Both Recommendation Sources ---
    search_recs, purchase_recs = pd.DataFrame(), pd.DataFrame()
    if purchase_history:
        search_recs = from_search_history(df, search_history,weights)
    if purchase_history:
        purchase_recs = from_purchase_history(df, purchased_categories, avg_purchase_price, weights, price_tolerance)

    combined = pd.concat([search_recs, purchase_recs], ignore_index=True)

    # Remove already purchased products
    combined = combined[~combined["product_id"].isin(purchase_history)]
    combined = remove_similar_items(combined, purchased_names)

    # Remove duplicates by item_number, keep max final_score
    combined = combined.groupby("product_id").agg({
        "Product Name": "first",
        "Category": "first",
        "Sale Price": "first",
        "similarity": "max",
        "sustainability_score": "mean",
        "final_score": "max",
        "Tags": "first"
    }).reset_index()

    # Sort and return top K
    return combined.sort_values("final_score", ascending=False)["_id"]

def user_home_page_recommendations(user_profile,workable_dataset):
    recommendations = home_page_recommendations(user_profile,workable_dataset)
    return recommendations