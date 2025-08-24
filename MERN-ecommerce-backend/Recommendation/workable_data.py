import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import os
from sklearn.feature_extraction.text import TfidfVectorizer

# --------------------------
# Load environment variables
# --------------------------
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")   # Ensure .env has: MONGO_URI=mongodb+srv://...
if not mongo_uri:
    raise ValueError("❌ MONGO_URI not found in .env file")

# --------------------------
# Mongo Connection
# --------------------------
client = MongoClient(mongo_uri)
db = client["test"]
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
# Globals
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
    """Cleans text and extracts alphanumeric tokens excluding stopwords"""
    if not isinstance(text, str):
        text = str(text)
    doc = nlp(text.lower())
    tags = [token.text for token in doc if token.text.isalnum() and token.text not in STOP_WORDS]
    return ','.join(tags)

def preprocess_dataset(df):
    """Generate tags column from important fields"""
    columns_to_extract_tags_from = ['title', 'brand', 'category_name']
    for column in columns_to_extract_tags_from:
        if column in df.columns:
            df[column] = df[column].apply(clean_and_extract_tags)
        else:
            df[column] = ""  # avoid KeyError if missing
    df['Tags'] = df[columns_to_extract_tags_from].apply(lambda row: ', '.join(row), axis=1)
    return df

def load_workable_data():
    """Fetch all data from Mongo into a DataFrame"""
    data = list(collection.find({}))
    df = pd.DataFrame(data)
    return df

def process_vectorizers():
    """Build TF-IDF vectorizers for recommendation system"""
    global vectorizer, tag_vectors
    global product_vectorizer, product_vectors
    global category_vectorizer, category_vectors

    print("🔄 Building TF-IDF vectorizers...")

    # Fill missing values
    workable_dataset["Tags"] = workable_dataset["Tags"].fillna("")
    workable_dataset["title"] = workable_dataset["title"].fillna("")
    workable_dataset["category_name"] = workable_dataset["category_name"].fillna("")

    # Tag vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    tag_vectors = vectorizer.fit_transform(workable_dataset["Tags"])

    # Title vectorizer
    product_vectorizer = TfidfVectorizer(stop_words='english')
    product_vectors = product_vectorizer.fit_transform(workable_dataset["title"])

    # Category vectorizer
    category_vectorizer = TfidfVectorizer(stop_words='english')
    category_vectors = category_vectorizer.fit_transform(workable_dataset["category_name"])

    print("✅ TF-IDF vectorizers ready!")

def refresh_cache():
    """Reload from DB, preprocess, save to disk, and rebuild vectorizers"""
    global workable_dataset
    df = load_workable_data()
    workable_dataset = preprocess_dataset(df)

    # Convert IDs to strings for parquet compatibility
    for col in ["product_id", "_id"]:
        if col in workable_dataset.columns:
            workable_dataset[col] = workable_dataset[col].astype(str)

    # Save locally
    workable_dataset.to_parquet(CACHE_FILE, index=False, engine="pyarrow")
    print("✅ Cache refreshed & saved to disk!")

    # Build vectorizers
    process_vectorizers()

# --------------------------
# Main: Load dataset
# --------------------------
if os.path.exists(CACHE_FILE):
    try:
        workable_dataset = pd.read_parquet(CACHE_FILE, engine="pyarrow")
        print("📂 Loaded dataset from cache file")
        print("ℹ Dataset info:")
        print(workable_dataset.info())
        process_vectorizers()
    except Exception as e:
        print("⚠ Failed to load cache, refreshing from DB...", e)
        refresh_cache()
else:
    print("⚡ No cache file found, loading from DB...")
    refresh_cache()