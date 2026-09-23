import { Link } from "react-router-dom";

export default function SurvivalHub() {
return (
<div className="min-h-screen bg-slate-950 text-white">
<header className="border-b border-red-900/40 bg-slate-950">
<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-7">
<Link to="/" className="text-sm font-medium text-slate-400 transition-colors hover:text-white" >
← Back to Games
</Link>

      <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
        Game 05
      </span>
    </div>
  </header>

  <main className="relative min-h-[calc(100vh-73px)] overflow-hidden">
    <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />

    <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-red-900/10 blur-3xl" />

    <section className="relative mx-auto max-w-5xl px-5 pb-16 pt-14 sm:px-7">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-red-500">
          Welcome to the Game
        </p>

        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
          The Survival Round
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Survive five challenging rounds and make it to the end.
          Every level gets harder. Every decision matters.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-5">
        <Link
          to="/survival-challenge/lobby"
          className="group block rounded-2xl border border-red-800/60 bg-slate-900/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-red-500 hover:bg-slate-900"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-2xl">
              🎮
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold transition-colors group-hover:text-red-400">
                Enter Lobby
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Enter the survival lobby and begin your journey through
                all five levels.
              </p>
            </div>

            <span className="text-xl text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-red-500">
              →
            </span>
          </div>
        </Link>

        <Link
          to="/survival-challenge/leaderboard"
          className="group block rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-yellow-600/60 hover:bg-slate-900"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-2xl">
              🏆
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold transition-colors group-hover:text-yellow-400">
                Leaderboard
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                See the top survival scores and compare your performance
                with other players.
              </p>
            </div>

            <span className="text-xl text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-yellow-500">
              →
            </span>
          </div>
        </Link>

        <Link
          to="/survival-challenge/stats"
          className="group block rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-600/60 hover:bg-slate-900"
        >
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
              📊
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold transition-colors group-hover:text-cyan-400">
                Score & Attempts
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Check your current score, completed levels, and number of
                attempts.
              </p>
            </div>

            <span className="text-xl text-slate-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-500">
              →
            </span>
          </div>
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-slate-500">
          <span>5 Levels</span>
          <span className="hidden sm:inline">•</span>
          <span>Single Player</span>
          <span className="hidden sm:inline">•</span>
          <span>Survive to Win</span>
        </div>
      </div>
    </section>
  </main>
</div>

);
}