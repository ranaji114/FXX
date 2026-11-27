"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f5f2ec] p-5 text-[#191817]"><section className="w-full max-w-md border border-black/10 bg-white p-7 text-center"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#c95029]">FXX admin</p><h1 className="mt-3 text-2xl font-black">Dashboard needs a refresh.</h1><p className="mt-3 text-sm leading-6 text-black/60">Your admin login is safe. Tap below to reload the dashboard.</p><button onClick={reset} className="mt-6 min-h-12 w-full bg-[#e66735] px-5 text-[10px] font-black uppercase tracking-[.12em] text-white">Reload dashboard</button></section></main>;
}
