export type TripCategory = "Backpacker" | "Standard" | "Luxury";
export type TravelStyle = "Family" | "Solo" | "Couple";

export type User = {
  id: number;
  email: string;
};

export type MessageRole = "user" | "assistant";

export type Message = {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  created_at: string;
};

export type Conversation = {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
};

export type ConversationDetail = Conversation & {
  messages: Message[];
};

export type SendMessageResponse = {
  user_message: Message;
  assistant_message: Message;
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
