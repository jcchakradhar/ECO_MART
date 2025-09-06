import random

def generate_motivation(user_profile):
    """
    Generate a personalized motivational message for sustainability
    based on user profile fields.
    """
    eco_score = user_profile.get("eco_score", 0)
    water_score = user_profile.get("water_score", 0)
    carbon_saved = user_profile.get("carbon_saved", 0)
    water_saved = user_profile.get("water_saved", 0)

    messages = []

    # 🌍 Achievement-based motivation
    if carbon_saved > 0:
        messages.extend([
            f"🌍 You’ve already saved {carbon_saved:.1f} kg of CO₂ — that's like planting {carbon_saved/21:.0f} trees 🌱.",
            f"🔥 Your choices prevented {carbon_saved:.1f} kg of CO₂ emissions — enough to power a laptop for {carbon_saved*2:.0f} hours!",
            f"🌱 {carbon_saved:.1f} kg of CO₂ saved! Imagine how clean the air feels because of you."
        ])
    if water_saved > 0:
        messages.extend([
            f"💧 You’ve conserved {water_saved:.0f} liters of water. Every drop counts!",
            f"💦 That’s {water_saved/200:.0f} showers worth of water saved 🚿 — amazing!",
            f"🌊 {water_saved:.0f} liters of water saved — you’re helping preserve our blue planet 💙."
        ])

    # 🌿 Score-based encouragement
    if eco_score >= 80:
        messages.extend([
            "🔥 Incredible! Your eco score is among the top eco-warriors 💚.",
            "🌟 You’re leading the green revolution with your eco-friendly habits.",
            "🏆 Eco Legend status unlocked — your sustainable choices are inspiring!"
        ])
    elif eco_score >= 50:
        messages.extend([
            "👍 You’re on the right track — keep choosing sustainable options!",
            "🌱 Steady progress! Each eco choice adds up to a big change.",
            "✨ Keep pushing — you’re halfway to becoming a sustainability hero!"
        ])
    else:
        messages.extend([
            "✨ Small steps make a big difference. Try one more eco-friendly switch today!",
            "🌍 Every choice matters — start small, change the world.",
            "💡 Even tiny eco-friendly changes ripple into a huge impact."
        ])

    if water_score >= 80:
        messages.extend([
            "💦 You’re a Water Hero! Your choices are saving precious water.",
            "🏞 Fantastic! Your water habits are protecting rivers and lakes.",
            "🌊 Outstanding! You’re leading the way in water conservation."
        ])
    elif water_score >= 50:
        messages.extend([
            "💧 Keep going — your water-saving impact is growing strong!",
            "🚿 Nice work! You’re halfway to becoming a Water Saver Champion.",
            "🌱 Consistency pays — your water habits are creating ripples of change."
        ])

    # 🛒 Behavioral nudges from user actions
    if user_profile["search_history"]:
        last_search = user_profile["search_history"][-1]
        messages.extend([
            f"Since you searched for '{last_search}', did you know eco alternatives could cut your footprint even more?",
            f"Looking for '{last_search}'? Choose eco-friendly versions to make a real difference 🌱.",
            f"Your interest in '{last_search}' shows you care — eco options can amplify your impact 🌍."
        ])

    if user_profile["purchase_history"]:
        last_purchase = user_profile["purchase_history"][-1]
        messages.extend([
            f"Your purchase of '{last_purchase}' was a sustainable win 🎉.",
            f"By choosing '{last_purchase}', you made a smarter choice for the planet 🌍.",
            f"'{last_purchase}' is a step toward a greener future — keep going 🌱."
        ])

    # 🎲 Shuffle & pick 3 unique motivational lines
    random.shuffle(messages)
    final_message = " ".join(messages[:1])

    return final_message


# ------------------- Example -------------------
user_profile = {
    "search_history": ["vegan soap", "eco toothpaste"],
    "purchase_history": ["GEN0", "GEN1"],
    "weights": {"carbon": 0.4, "water": 0.3, "rating": 0.3},
    "price_tolerance": 0.2,
    "eco_score": 72,
    "water_score": 85,
    "carbon_saved": 14.2,
    "water_saved": 320
}

print(generate_motivation(user_profile))