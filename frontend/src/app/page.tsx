import TripForm from "@/components/TripForm";
import RequireAuth from "@/components/RequireAuth";

export default function Home() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}

function HomeContent() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-orange-400 pb-28 pt-20 sm:pb-36 sm:pt-28">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-end justify-center opacity-20 sm:opacity-30"
        >
          <svg viewBox="0 0 400 120" className="h-32 w-full max-w-4xl">
            <path
              d="M0 100 L60 40 L100 80 L150 20 L200 90 L260 30 L310 85 L360 50 L400 100 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium text-white ring-1 ring-white/30">
            Powered by KelanaAI
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your next adventure,
            <br className="hidden sm:block" /> planned in seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-sky-50">
            Tell us your destination and budget — KelanaAI builds a
            day-by-day itinerary tailored just for you.
          </p>
        </div>
      </section>

      <TripForm />

      <div className="h-16 sm:h-20" />
    </div>
  );
}
