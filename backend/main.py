def print_trip_summary(destination, country, days, budget, currency, travel_month):
    budget_per_day = budget / days

    print("\n" + "=" * 40)
    print("        KELANA AI - TRIP SUMMARY")
    print("=" * 40)
    print(f"Destination     : {destination}, {country}")
    print(f"Travel Month    : {travel_month}")
    print(f"Duration        : {days} days")
    print(f"Total Budget    : {currency} {budget:,.2f}")
    print(f"Budget per Day  : {currency} {budget_per_day:,.2f}")
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
