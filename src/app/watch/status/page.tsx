import Link from "next/link";

export default function WatchStatusPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center space-y-3 px-6">
      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      
      <h2 className="text-lg font-bold">All Systems Go</h2>
      <p className="text-xs text-neutral-400">
        8 matches active<br/>
        No incidents reported
      </p>

      <Link
        href="/watch"
        className="mt-4 w-full bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-full py-2 px-4 text-xs font-semibold transition-colors"
      >
        Back
      </Link>
    </div>
  );
}
