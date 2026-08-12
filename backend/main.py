from services.trip_service import (
    get_trip_category,
    get_travel_season,
    calculate_daily_budget,
    get_recommended_places,
)


def print_trip_summary(destination, country, days, budget, currency, travel_month):
    trip_category = get_trip_category(budget)
    travel_season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    recommended_places = get_recommended_places(trip_category)

    print("\n" + "=" * 40)
    print("        KELANA AI - TRIP SUMMARY")
    print("=" * 40)
    print(f"Destination     : {destination}, {country}")
    print(f"Travel Month    : {travel_month}")
    print(f"Duration        : {days} days")
    print(f"Total Budget    : {currency} {budget:,.2f}")
    print(f"Budget per Day  : {currency} {daily_budget:,.2f}")
    print(f"Trip Category   : {trip_category}")
    print(f"Travel Season   : {travel_season}")
    print("-" * 40)
    print("Recommended Places:")
    for place in recommended_places:
        print(f"  - {place}")
    print("=" * 40)
    print(f"Enjoy your trip to {destination}! 🌍")
    print("=" * 40 + "\n")


def main():
    print("Welcome to KelanaAI Trip Summary Generator!\n")

    destination = input("Enter destination: ")
    country = input("Enter country: ")
    days = int(input("Enter number of days: "))
    budget = float(input("Enter total budget: "))
    currency = input("Enter currency (e.g. IDR, USD): ")
    travel_month = input("Enter travel month: ")

    print_trip_summary(destination, country, days, budget, currency, travel_month)


if __name__ == "__main__":
    main()
