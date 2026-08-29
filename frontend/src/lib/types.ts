export type TripCategory = "Backpacker" | "Standard" | "Luxury";
export type TravelStyle = "Family" | "Solo" | "Couple";

export type User = {
  id: number;
  email: string;
};

export type Trip = {
  id: number;
  user_id: number;
  destination: string;
  country: string;
  days: number;
  budget: number;
  currency: string;
  travel_month: string;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
};
