import type { Trip } from "@/lib/types";
import { getCountryFlag } from "@/lib/countryFlag";

const CATEGORY_STYLES: Record<string, string> = {
  Backpacker: "bg-emerald-100 text-emerald-700",
  Standard: "bg-sky-100 text-sky-700",
  Luxury: "bg-amber-100 text-amber-700",
};

const TRAVEL_STYLE_STYLES: Record<string, string> = {
  Family: "bg-purple-100 text-purple-700",
  Solo: "bg-slate-100 text-slate-700",
  Couple: "bg-rose-100 text-rose-700",
};

function formatBudget(budget: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }).format(budget);
  } catch {
    return `${currency} ${budget.toLocaleString()}`;
  }
}

function LandmarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2 L20 9 H4 L12 2 Z M5 9 V20 M9 9 V20 M15 9 V20 M19 9 V20 M3 20 H21"
      />
    </svg>
  );
}

export default function TripCard({ trip }: { trip: Trip }) {
  const flag = getCountryFlag(trip.country);
  const categoryStyle = CATEGORY_STYLES[trip.category] ?? "bg-slate-100 text-slate-700";
  const travelStyleStyle = TRAVEL_STYLE_STYLES[trip.travel_style] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-lg leading-none">
            {flag ?? <LandmarkIcon />}
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">{trip.destination}</h3>
            <p className="text-xs text-slate-500">{trip.country}</p>
          </div>
        </div>
        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
          {formatBudget(trip.budget, trip.currency)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${categoryStyle}`}
        >
          {trip.category}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${travelStyleStyle}`}
        >
          {trip.travel_style}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {trip.days} {trip.days === 1 ? "day" : "days"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{trip.travel_month}</span>
        <span>Daily: {formatBudget(trip.daily_budget, trip.currency)}</span>
      </div>
    </div>
  );
}
