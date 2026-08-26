"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type TripResult = {
  category: string;
  daily_budget: number;
  ai_recommendation: string | null;
};

export default function TripForm() {
  const [form, setForm] = useState({
    destination: "",
    country: "",
    days: "",
    budget: "",
    currency: "USD",
    travel_month: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TripResult | null>(null);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const createRes = await fetch(`${API_BASE_URL}/api/v1/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          days: Number(form.days),
          budget: Number(form.budget),
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create trip");
      const trip = await createRes.json();

      const generateRes = await fetch(
        `${API_BASE_URL}/api/v1/trips/${trip.id}/generate`,
        { method: "POST" }
      );

      if (!generateRes.ok) throw new Error("Failed to generate itinerary");
      const generated = await generateRes.json();
      setResult(generated);
    } catch {
      setError("Something went wrong. Please check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto -mt-10 w-full max-w-3xl px-4 sm:-mt-16 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 sm:grid-cols-2 sm:p-8"
      >
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Plan your trip
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tell us where you&apos;re headed and we&apos;ll build your itinerary.
          </p>
        </div>

        <Field label="Destination">
          <input
            required
            value={form.destination}
            onChange={handleChange("destination")}
            placeholder="Bali"
            className={inputClass}
          />
        </Field>

        <Field label="Country">
          <input
            required
            value={form.country}
            onChange={handleChange("country")}
            placeholder="Indonesia"
            className={inputClass}
          />
        </Field>

        <Field label="Days">
          <input
            required
            type="number"
            min={1}
            value={form.days}
            onChange={handleChange("days")}
            placeholder="5"
            className={inputClass}
          />
        </Field>

        <Field label="Budget">
          <input
            required
            type="number"
            min={0}
            value={form.budget}
            onChange={handleChange("budget")}
            placeholder="1500"
            className={inputClass}
          />
        </Field>

        <Field label="Currency">
          <select
            value={form.currency}
            onChange={handleChange("currency")}
            className={inputClass}
          >
            <option value="USD">USD</option>
            <option value="IDR">IDR</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        </Field>

        <Field label="Travel Month">
          <input
            required
            value={form.travel_month}
            onChange={handleChange("travel_month")}
            placeholder="December"
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Generating itinerary..." : "Generate Itinerary"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
        )}
      </form>

      {result && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              {result.category}
            </span>
            <span className="text-sm text-slate-500">
              Daily budget: {result.daily_budget.toLocaleString()}
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
            {result.ai_recommendation}
          </pre>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
