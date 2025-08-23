import numpy as np
import pandas as pd
from workable_data import workable_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

def form_vectorizer_tag_vectors(df):
    df["Tags"] = df["Tags"].fillna("")
    vectorizer = TfidfVectorizer(stop_words='english')
    tag_vectors = vectorizer.fit_transform(df["Tags"])
    return vectorizer, tag_vectors

def form_vectorizer_product_names(df):
    df["title"] = df["title"].fillna("")
    vectorizer = TfidfVectorizer(stop_words='english')
    name_vectors = vectorizer.fit_transform(df["title"])
    return vectorizer, name_vectors

def form_vectorizer_categories(df):
    df["category_name"] = df["category_name"].fillna("")
    vectorizer = TfidfVectorizer(stop_words='english')
    category_vectors = vectorizer.fit_transform(df["category_name"])
    return vectorizer, category_vectors

def get_user_avg_price(purchased_df, df):
    return purchased_df['price'].mean() if not purchased_df.empty else None

vectorizer, tag_vectors = form_vectorizer_tag_vectors(workable_dataset)
product_vectorizer, product_vectors = form_vectorizer_product_names(workable_dataset)
category_vectorizer, category_vectors = form_vectorizer_categories(workable_dataset)




# from workable_data import workable_dataset, tag_vectors
# print(workable_dataset.info())
# print(tag_vectors.shape)