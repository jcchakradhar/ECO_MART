import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os 
from workable_data import workable_dataset

# # 1. Connect to your Atlas cluster (replace <user>, <password>, <cluster>, <dbname>)


# load_dotenv()

# # Get values from .env
# MONGO_URI = os.getenv("MONGO_URI")
# client = MongoClient(MONGO_URI)
# # 2. Select database and collection
# db = client["test"]
# collection = db["products"]

# # 3. Fetch all documents
# cursor = collection.find({})   # {} means no filter, fetch everything

# # 4. Convert cursor → list → DataFrame
# df = pd.DataFrame(list(cursor))

# # 5. (Optional) Drop MongoDB internal `_id` if not needed


# # print("Fetched DataFrame shape:", df.shape)
# # print("Columns:", df.columns.tolist())
# print(df.head())
print(workable_dataset.info())