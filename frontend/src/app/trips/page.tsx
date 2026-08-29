"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TripCard from "@/components/TripCard";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL, authHeaders } from "@/lib/api";
import type { Trip } from "@/lib/types";

const PAGE_SIZE = 10;

export default function TripsPage() {
  return (
    <RequireAuth>
      <TripsDashboard />
    </RequireAuth>
  );
}

function TripsDashboard() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function loadTrips() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/trips`, {
          headers: authHeaders(token),
        });
        if (res.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load trips");
        const data = await res.json();
        if (!cancelled) setTrips(data);
      } catch {
        if (!cancelled) setError("Something went wrong. Please check that the backend is running.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      cancelled = true;
    };
  }, [token, logout, router]);

  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));

  const visibleTrips = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return trips.slice(start, start + PAGE_SIZE);
  }, [trips, page]);

  const goToPage = (next: number) => {
    setPage(Math.min(Math.max(next, 1), totalPages));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Trip History</h1>
        <p className="mt-1 text-sm text-slate-500">
          {trips.length} {trips.length === 1 ? "trip" : "trips"} planned so far.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading trips...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && trips.length === 0 && (
        <p className="text-sm text-slate-500">No trips yet. Plan your first trip to see it here.</p>
      )}

      {!loading && !error && trips.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {trips.length > PAGE_SIZE && (
            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          )}
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Trip history pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            p === page
              ? "bg-orange-500 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
