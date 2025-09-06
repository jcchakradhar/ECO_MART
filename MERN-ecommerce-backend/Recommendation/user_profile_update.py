def update_price_tolerance(user_profile, product_price, avg_price, action_type, min_tol=0.03, max_tol=0.75):
    current_tol = user_profile.get("price_tolerance", 0.2)
    lower_bound = avg_price * (1 - current_tol)
    upper_bound = avg_price * (1 + current_tol)

    # Check if product price is outside current tolerance
    outside_tolerance = (product_price < lower_bound) or (product_price > upper_bound)

    if action_type == "add to cart":
        if outside_tolerance:
            # Increase tolerance to be more flexible
            current_tol = min(max_tol, current_tol + 0.03)
        else:
            # Decrease tolerance to be more strict
            current_tol = max(min_tol, current_tol - 0.01)
    elif action_type== "purchase":
        if outside_tolerance:
            # Increase tolerance to be more flexible
            current_tol = min(max_tol, current_tol + 0.05)
        else:
            # Decrease tolerance to be more strict
            current_tol = max(min_tol, current_tol - 0.01)

    user_profile["price_tolerance"] = current_tol
    return user_profile


def update_user_weights(user_profile, avg_price, product_row, action_type):
    delta = action_weight_delta.get(action_type, 0.02)  # default to small shift
    weights = user_profile["weights"]

    # Normalize current weights
    total_w = sum(weights.values())
    weights = {k: v / total_w for k, v in weights.items()}

    # Get sustainability scores of product
    eco_score = carbon_grade_to_score.get(product_row["Eco_Rating"], 0)
    water_score = water_grade_to_score.get(product_row["Water_Rating"], 0)
    rating_score = product_row.get("rating", 0) or 0
    product_price = product_row.get("price",0) 

    # Normalize product score vector
    total_p = eco_score + water_score + rating_score
    if total_p == 0:
        return user_profile  # no update if invalid product

    product_vector = {
        "carbon": eco_score / total_p,
        "water": water_score / total_p,
        "rating": rating_score / total_p
    }

    # Update weights with learning rate
    updated_weights = {
        key: (1 - delta) * weights[key] + delta * product_vector[key]
        for key in weights
    }

    # Normalize final weights
    total_upd = sum(updated_weights.values())
    user_profile["weights"] = {k: v / total_upd for k, v in updated_weights.items()}
    user_profile = update_price_tolerance(user_profile, product_price, avg_price, action_type, min_tol=0.03, max_tol=0.75)

    return user_profile