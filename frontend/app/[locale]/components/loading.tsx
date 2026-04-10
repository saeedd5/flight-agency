import { FlightCardSkeleton } from "./components/FlightCardSkeleton";
import { FlightSearchForm } from "./components/FlightSearchForm";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* نمایش بنر و فرم (بدون تغییر) */}
      <div className="bg-slate-900 pt-24 pb-36 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
            Finding Your Perfect Flight...
          </h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Please wait while we search hundreds of airlines.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <FlightSearchForm />
      </div>

      {/* نمایش اسکلت‌های لودینگ به جای نتایج */}
      <div className="container mx-auto px-4 mt-16 max-w-4xl">
        <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 animate-pulse">
            <div className="h-6 w-48 rounded bg-slate-200 mb-2"></div>
            <div className="h-4 w-64 rounded bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <FlightCardSkeleton />
          <FlightCardSkeleton />
          <FlightCardSkeleton />
        </div>
      </div>
    </main>
  );
}