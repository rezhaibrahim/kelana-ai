import json

import boto3

MODEL_ID = "amazon.nova-lite-v1:0"

_client = boto3.client("bedrock-runtime", region_name="ap-southeast-2")


def generate_itinerary(destination, country, days, budget, currency, travel_month, category):
    prompt = f"""You are a professional travel planner. Create a detailed day-by-day itinerary for a trip to {destination}, {country}.

Trip details:
- Duration: {days} days
- Budget: {budget} {currency} ({category} traveler)
- Travel month: {travel_month}

For EACH day, structure the plan into exactly three sections:

Morning:
- Give 2-3 specific morning activities (name real places/attractions when possible).

Afternoon:
- Recommend cultural sites (museums, temples, landmarks, etc.) and local experiences relevant to the destination.

Evening:
- Suggest specific dinner spots and nightlife or evening entertainment options.

Format the output exactly like this example for each day:

Day 1: <short theme for the day>

Morning:
- ...
- ...

Afternoon:
- ...
- ...

Evening:
- ...
- ...

Repeat this structure for all {days} days. Keep recommendations specific, realistic, and suited to a {category.lower()} budget."""

    response = _client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(
            {
                "messages": [{"role": "user", "content": [{"text": prompt}]}],
                "system": [{"text": "You are a professional travel planner."}],
            }
        ),
    )

    body = json.loads(response["body"].read())
    return body["output"]["message"]["content"][0]["text"]