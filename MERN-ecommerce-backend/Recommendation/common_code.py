import numpy as np
import pandas as pd
from workable_data import workable_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from workable_data import vectorizer, tag_vectors

user_profile = {
    "search_history": ["vegan soap", "eco toothpaste"],
    "purchase_history": ["GEN0", "GEN1"],
    "weights": {
        "carbon": 0.4,
        "water": 0.3,
        "rating": 0.3
    },
    "price_tolerance": 0.2
}

search_history = user_profile["search_history"]
purchase_history = user_profile["purchase_history"]
weights = user_profile["weights"]
price_tolerance = user_profile["price_tolerance"]

water_grade_to_score = {
    "A+": 5,
    "A": 4,
    "B": 3,
    "C": 2,
    "D": 1,
    "Unknown": 0
}

carbon_grade_to_score = {
    "A+": 5,
    "A": 4,
    "B": 3,
    "C": 2,
    "D": 1,
    "Unknown": 0
}

def remove_similar_items(df, purchased_names, threshold=0.8):
    name_vecs = vectorizer.transform(df["title"])
    purchased_vecs = vectorizer.transform(purchased_names)
    sim_matrix = cosine_similarity(name_vecs, purchased_vecs)
    
    # Find max similarity with any purchased item
    max_sim = sim_matrix.max(axis=1)
    return df[max_sim < threshold]

def calculate_product_score(row, weights):
    return (
        weights["rating"] * row["rating"] +
        weights["eco"] * carbon_grade_to_score[row["Eco_Rating"]] +
        weights["water"] * water_grade_to_score[row["Water_Rating"]]
    )

def get_user_avg_price(purchased_df, df):
    return purchased_df['price'].mean() if not purchased_df.empty else None





# from workable_data import workable_dataset, tag_vectors
# print(workable_dataset.info())
# print(tag_vectors.shape)