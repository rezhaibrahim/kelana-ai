RECOMMENDED_PLACES = {
    "Backpacker": ["Hostel Backpacker", "Local Street Food Market", "Public Beach"],
    "Standard": ["3-Star Hotel", "Popular Tourist Attractions", "Local Restaurants"],
    "Luxury": ["5-Star Resort", "Private Tour", "Fine Dining Restaurant"],
}


def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month):
    if month == "December":
        return "Peak Season"
    elif month == "June":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget, days):
    return budget / days


def get_recommended_places(trip_category):
    places = RECOMMENDED_PLACES.get(trip_category, [])
    recommendations = []
    for place in places:
        recommendations.append(place)
    return recommendations
