//frontend/app/components/FlightCardSkeleton.jsx : 

import { Card } from "@/components/ui/card";

export function FlightCardSkeleton() {
  return (
    <Card className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse flex-col md:flex-row">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-slate-200"></div>
              <div className="space-y-2">
                <div className="h-2 w-24 rounded bg-slate-200"></div>
                <div className="h-2 w-32 rounded bg-slate-200"></div>
              </div>
            </div>
            <div className="h-4 w-16 rounded-full bg-slate-200"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-[90px] space-y-2">
              <div className="h-4 w-16 rounded bg-slate-200 ml-auto"></div>
              <div className="h-2 w-12 rounded bg-slate-200 ml-auto"></div>
            </div>
            <div className="h-2 flex-1 max-w-[120px] rounded-full bg-slate-200"></div>
            <div className="w-[90px] space-y-2">
              <div className="h-4 w-16 rounded bg-slate-200"></div>
              <div className="h-2 w-12 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[220px] mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 flex flex-row md:flex-col justify-between items-center md:items-end md:pl-5">
          <div className="space-y-2 text-right">
            <div className="h-4 w-24 rounded bg-slate-200"></div>
            <div className="h-2 w-20 rounded bg-slate-200"></div>
          </div>
          <div className="h-11 w-32 rounded-lg bg-slate-200 mt-0 md:mt-4"></div>
        </div>
      </div>
    </Card>
  );
}