from common_code import calculate_product_score, user_profile
import pandas as pd
from workable_data import workable_dataset

def home_page(df,weights):
    df_products = df.copy()
    df_products["score"] = df_products.apply(calculate_product_score, axis=1,weights=weights)
    new_user_recommended = df_products.sort_values("score", ascending=False)
    return new_user_recommended["_id"]



def new_user_home_page_recommendations():
    weights = user_profile["weights"]
    recommendations = home_page(workable_dataset, weights)
    return recommendations