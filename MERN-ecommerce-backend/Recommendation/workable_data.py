# import pandas as pd
# from pymongo import MongoClient
# import spacy
# from spacy.lang.en.stop_words import STOP_WORDS

# def load_workable_data():
#     client = MongoClient("mongodb://localhost:27017/ecomart")
     
#     db = client["ecomart"]
#     collection = db["products"]

#     data = list(collection.find())

#     df = pd.DataFrame(data)

#     # Drop the '_id' column if you don't need it
#     if "_id" in df.columns:
#         df = df.drop(columns=["_id"])
#     # df = df.drop(columns = ["__v","colors","deleted","discountPercentage","highlights","images","sizes"],inplace=True,errors="ignore")

#     return df

# nlp = spacy.load("en_core_web_sm")

# def clean_and_extract_tags(text):
#     if not isinstance(text, str):
#         text = str(text) 
#     doc = nlp(text.lower())
#     tags= [token.text for token in doc if token.text.isalnum() and token.text not in STOP_WORDS]
#     return ','.join(tags)

# df_products = load_workable_data()
# columns_to_extract_tags_from = ['title','brand', 'category_name']

# for column in columns_to_extract_tags_from:
#     df_products[column] = df_products[column].apply(clean_and_extract_tags)

# df_products['Tags'] = df_products[columns_to_extract_tags_from].apply(lambda row: ', '.join(row), axis=1)
# workable_dataset = df_products 
# # print(df_products.info())\

# import pandas as pd
# from pymongo import MongoClient
# import spacy
# from spacy.lang.en.stop_words import STOP_WORDS
# from pymongo.errors import OperationFailure
# import threading
# import os

# # ✅ Mongo Connection
# client = MongoClient("mongodb://localhost:27017/ecomart")
# db = client["ecomart"]
# collection = db["products"]

# # ✅ Cache file path
# CACHE_FILE = "workable_dataset.parquet"

# # ✅ Load NLP
# nlp = spacy.load("en_core_web_sm")

# def clean_and_extract_tags(text):
#     if not isinstance(text, str):
#         text = str(text)
#     doc = nlp(text.lower())
#     tags = [token.text for token in doc if token.text.isalnum() and token.text not in STOP_WORDS]
#     return ','.join(tags)

# def preprocess_dataset(df):
#     columns_to_extract_tags_from = ['title', 'brand', 'category_name']
#     for column in columns_to_extract_tags_from:
#         if column in df.columns:
#             df[column] = df[column].apply(clean_and_extract_tags)
#     df['Tags'] = df[columns_to_extract_tags_from].apply(lambda row: ', '.join(row), axis=1)
#     return df

# def load_workable_data():
#     data = list(collection.find())
#     df = pd.DataFrame(data)

#     # # Drop unwanted columns
#     # if "_id" in df.columns:
#     #     df = df.drop(columns=["_id"])

#     return df

# def refresh_cache():
#     """Reload from DB, preprocess and save to disk"""
#     global workable_dataset
#     df = load_workable_data()
#     workable_dataset = preprocess_dataset(df)
#     if "product_id" in workable_dataset.columns:
#         workable_dataset["product_id"] = workable_dataset["product_id"].astype(str)
#     if "_id" in workable_dataset.columns:
#         workable_dataset["_id"] = workable_dataset["_id"].astype(str)
#     workable_dataset.to_parquet(CACHE_FILE, index=False)
#     print("✅ Cache refreshed & saved to disk!")

# # ✅ Initialize dataset
# if os.path.exists(CACHE_FILE):
#     workable_dataset = pd.read_parquet(CACHE_FILE)
#     print("📂 Loaded dataset from cache file")
# else:
#     print("⚡ No cache file found, loading from DB...")
#     refresh_cache()

# # ✅ Background listener for MongoDB changes
# def watch_changes():
#     try:
#         with collection.watch() as stream:
#             for change in stream:
#                 print("DB changed, refreshing cache...")
#                 refresh_cache()
#     except OperationFailure as e:
#         print("⚠️ Change Streams not supported (not a replica set). Skipping DB watch.")
# # def watch_changes():
# #     with collection.watch() as stream:
# #         for change in stream:
# #             print("🔄 Change detected in DB:", change["operationType"])
# #             refresh_cache()

# listener_thread = threading.Thread(target=watch_changes, daemon=True)
# listener_thread.start()

#no change stream supported 
import pandas as pd
from pymongo import MongoClient
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import threading
import os
from sklearn.feature_extraction.text import TfidfVectorizer

# --------------------------
# Mongo Connection (standalone, no replica set)
# --------------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["ecomart"]
collection = db["products"]

# --------------------------
# Cache file path
# --------------------------
CACHE_FILE = "workable_dataset.parquet"

# --------------------------
# Load NLP
# --------------------------
nlp = spacy.load("en_core_web_sm")

# --------------------------
# Global variables
# --------------------------
workable_dataset = None
vectorizer = None
tag_vectors = None
product_vectorizer = None
product_vectors = None
category_vectorizer = None
category_vectors = None

# --------------------------
# Functions
# --------------------------
def clean_and_extract_tags(text):
    if not isinstance(text, str):
        text = str(text)
    doc = nlp(text.lower())
    tags = [token.text for token in doc if token.text.isalnum() and token.text not in STOP_WORDS]
    return ','.join(tags)

def preprocess_dataset(df):
    columns_to_extract_tags_from = ['title', 'brand', 'category_name']
    for column in columns_to_extract_tags_from:
        if column in df.columns:
            df[column] = df[column].apply(clean_and_extract_tags)
    df['Tags'] = df[columns_to_extract_tags_from].apply(lambda row: ', '.join(row), axis=1)
    return df

def load_workable_data():
    data = list(collection.find())
    df = pd.DataFrame(data)
    return df

def process_vectorizers():
    """Build TF-IDF vectorizers for recommendation system"""
    global vectorizer, tag_vectors
    global product_vectorizer, product_vectors
    global category_vectorizer, category_vectors

    print("🔄 Building TF-IDF vectorizers...")

    workable_dataset["Tags"] = workable_dataset["Tags"].fillna("")
    vectorizer = TfidfVectorizer(stop_words='english')
    tag_vectors = vectorizer.fit_transform(workable_dataset["Tags"])

    workable_dataset["title"] = workable_dataset["title"].fillna("")
    product_vectorizer = TfidfVectorizer(stop_words='english')
    product_vectors = product_vectorizer.fit_transform(workable_dataset["title"])

    workable_dataset["category_name"] = workable_dataset["category_name"].fillna("")
    category_vectorizer = TfidfVectorizer(stop_words='english')
    category_vectors = category_vectorizer.fit_transform(workable_dataset["category_name"])

    print("✅ TF-IDF vectorizers ready!")

def refresh_cache():
    """Reload from DB, preprocess, save to disk, and rebuild vectorizers"""
    global workable_dataset
    df = load_workable_data()
    workable_dataset = preprocess_dataset(df)

    # Convert IDs to strings for parquet
    for col in ["product_id", "_id"]:
        if col in workable_dataset.columns:
            workable_dataset[col] = workable_dataset[col].astype(str)

    workable_dataset.to_parquet(CACHE_FILE, index=False)
    print("✅ Cache refreshed & saved to disk!")

    # Build vectorizers
    process_vectorizers()

# --------------------------
# Initialize dataset
# --------------------------
if os.path.exists(CACHE_FILE):
    workable_dataset = pd.read_parquet(CACHE_FILE)
    print("📂 Loaded dataset from cache file")
    process_vectorizers()  # also build vectorizers
else:
    print("⚡ No cache file found, loading from DB...")
    refresh_cache()

# ----------------

    