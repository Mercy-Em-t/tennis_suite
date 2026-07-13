import React from "react";

export function WatchFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center font-sans">
      <div className="relative">
        {/* Watch Bezel Simulation */}
        <div className="w-[420px] h-[420px] bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-700">
          {/* Active Screen Area - 390x390 */}
          <div className="w-[390px] h-[390px] bg-black rounded-full overflow-hidden relative text-white">
            {/* Safe Area - center 70% */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {children}
            </div>
          </div>
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-16 bg-neutral-700 rounded-r-md"></div> {/* Crown */}
      </div>
    </div>
  );
}
