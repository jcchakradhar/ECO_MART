import pandas as pd
from common_code import calculate_product_score, vectorizer, tag_vectors, get_user_avg_price
from sklearn.metrics.pairwise import cosine_similarity
from common_code import search_history, purchase_history, weights, price_tolerance
from common_code import remove_similar_items
from common_code import user_profile
from sklearn.feature_extraction.text import TfidfVectorizer


def get_better_products_in_price_range(price_alts, item_price, tolerance):
    min_price = item_price * (1 - tolerance)
    max_price = item_price * (1 + tolerance)
    price_alts = price_alts[(price_alts["price"] >= min_price) & (price_alts["price"] <= max_price)]
    return price_alts

def cart_alternatives(item, df, top_k=10):
    # Step 1: Compute sustainability scores for all products
    df_copy = df.copy()
    df_copy["sustainability_score"] = df_copy.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )
    
    # Step 2: Vectorize product names
    vectorizer = TfidfVectorizer()
    name_corpus = df_copy["Product Name"].fillna("").astype(str).tolist()
    vectorizer.fit(name_corpus)
    # Step 3: Find more sustainable alternatives
    df_copy["sustainability_score"] = df_copy.apply(
        lambda row: calculate_product_score(row, weights), axis=1
    )

    recommendations = []
        
    item_number=item["product_id"]
    
    if item_number not in df["product_id"].values:
        return None

    df_cart_item = df[df["product_id"] == item_number].iloc[0]
    item_name = df_cart_item["title"]
    item_number = df_cart_item["product_id"]
    item_category = df_cart_item.get("category_name", "")
    item_price = df_cart_item.get("price", 0)
    item_score = calculate_product_score(df_cart_item, weights)

    better_alts = df_copy[
        (df_copy["sustainability_score"] >= item_score) &
        (df_copy["product_id"] != item_number)
    ].copy()

    tolerance = price_tolerance
    while tolerance <= 0.5:  # or set max limit
        better_alts = get_better_products_in_price_range(better_alts, item_price, tolerance)
        if len(better_alts) >= top_k:
            break
        tolerance += 0.05  # increment step

    # if better_alts.empty:
    #     continue

    # Step 4: Compute name similarity
    item_vec = vectorizer.transform([item_name])
    alt_vecs = vectorizer.transform(better_alts["title"].fillna(""))
    name_similarity = cosine_similarity(alt_vecs, item_vec).flatten()

    # Step 5: Category similarity
    category_score = better_alts["category"].apply(
        lambda c: 1.0 if c == item_category else 0.5 if item_category in str(c) or str(c) in item_category else 0.0
    )
    
    # Step 6: Normalize sustainability score [0,1]
    sustainability_scaled = better_alts["sustainability_score"] / 5

    # Step 7: Compute final score with weighted factors
    better_alts["name_similarity"] = name_similarity
    better_alts["category_score"] = category_score
    better_alts["sustainability_scaled"] = sustainability_scaled
    better_alts["final_score"] = (
        0.5 * better_alts["name_similarity"] +
        0.2 * better_alts["category_score"] +
        0.3 * better_alts["sustainability_scaled"]
    )

    # Step 8: Sort and select
    better_alts = better_alts.sort_values(by="final_score", ascending=False)

    # Tag original item for traceability
    better_alts["original_item"] = item_name

    # If single product in cart → recommend all better
    # if len(cart_items) == 1:
    #     recommendations.append(better_alts)
    # else:
    recommendations.append(better_alts.head(top_k))

    # Final concatenated DataFrame
    # if recommendations:
    return recommendations["product_id"]
    # else:
    #     return pd.DataFrame(columns=[
    #         "original_item", "Product Name", "Category", "Sale Price", 
    #         "sustainability_score", "name_similarity", "category_score", 
    #         "sustainability_scaled", "final_score"
    #     ])
