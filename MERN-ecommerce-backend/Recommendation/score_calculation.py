import random
import pandas as pd

def calculate_sustainability_metrics(
    purchased_product, df_products, group_delivery=False
):

    # ---- Step 1: Compute baseline per category ----
    baseline_df = (
        df_products.groupby("category_name")
        .agg({"Carbon_Footprint_kgCO2e": "mean", "Water_Usage_Litres": "mean"})
        .reset_index()
        .rename(columns={"Carbon_Footprint_kgCO2e": "baseline_carbon_fp", "Water_Usage_Litres": "baseline_water_fp"})
    )

    # ---- Step 2: Lookup baseline for purchased product's category ----
    cat = purchased_product["category_name"]
    baseline_row = baseline_df[baseline_df["category_name"] == cat]

    if baseline_row.empty:
        # fallback: global average if category baseline not found
        baseline_carbon = df_products["Carbon_Footprint_kgCO2e"].mean()
        baseline_water = df_products["Water_Usage_Litres"].mean()
    else:
        baseline_carbon = baseline_row["baseline_carbon_fp"].values[0]
        baseline_water = baseline_row["baseline_water_fp"].values[0]

    # ---- Step 3: Calculate savings ----
    carbon_saved = round(baseline_carbon - purchased_product["Carbon_Footprint_kgCO2e"], 2)
    water_saved = round(baseline_water - purchased_product["Water_Usage_Litres"], 2)

    # ---- Step 4: Ratings (1–5 already scaled) ----
    eco_score = 2*carbon_grade_to_score[purchased_product.get("Eco_Rating", "B+")]
    water_score = 2*water_grade_to_score[purchased_product.get("Water_Rating", "B+")]

    # ---- Step 5: Group delivery bonus ----
    if group_delivery:
        eco_score = min(10, eco_score + 0.5)
        water_score = min(10, water_score + 0.5)
        carbon_saved += 0.2
        water_saved += 5

    # ---- Step 6: Friendly message ----
    if carbon_saved > 0 or water_saved > 0:
        message = random.choice([
            f"🌱 Great choice! You saved {carbon_saved} kg CO2 and {water_saved}L water.",
            f"💚 Thanks for choosing sustainably! That’s {carbon_saved} kg CO2 and {water_saved}L water saved.",
            f"🌍 Your purchase helped reduce {carbon_saved} kg CO2 and {water_saved}L water. Keep it up!"
        ])
    else:
        message = random.choice([
            "🤔 This product uses more resources than average. Next time, you could save more with greener alternatives.",
            "⚡ This item has higher footprint. Consider grouped delivery or eco-friendly options next time!",
            "🌱 Small steps matter. Explore sustainable choices to reduce impact further."
        ])

    return {
        "carbon_saved": carbon_saved,
        "water_saved": water_saved,
        "eco_score": eco_score,
        "water_score": water_score,
        "message": message,
    }


result = calculate_sustainability_metrics(purchased_product, df_products, group_delivery=True)
print(result)