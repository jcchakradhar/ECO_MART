from common_code import calculate_product_score, form_vectorizer_tag_vectors
import pandas as pd

def home_page(df,weights):
    df_products = df.copy()
    df_products["score"] = df_products.apply(calculate_product_score, axis=1,weights=weights)
    new_user_recommended = df_products.sort_values("score", ascending=False)
    return new_user_recommended["product_id"]