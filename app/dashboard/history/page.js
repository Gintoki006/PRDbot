"use client";

import HistoryTable from "../_components/HistoryTable";

export default function HistoryPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto h-full flex flex-col">
      <div className="mb-6 flex-none">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Action History
        </h1>
        <p className="text-sm text-gh-text-secondary mt-1">
          Review past agent evaluations across all your repositories.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <HistoryTable />
      </div>
    </div>
  );
}
