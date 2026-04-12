import Link from "next/link";
import { ArrowRight, BarChart3, Map, ShieldAlert, Sparkles } from "lucide-react";
import { BrandMark } from "../components/BrandMark";
import { STADIUMS_INDIA } from "../lib/stadiums";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/40">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between">
        <BrandMark href="/" />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-200 hover:text-white transition px-3 py-2 rounded-xl hover:bg-white/5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition shadow-[0_0_18px_rgba(37,99,235,0.35)]"
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="px-4 sm:px-6 pb-16">
        <section className="max-w-6xl mx-auto pt-10 sm:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Realtime crowd intelligence • Digital twin • Incident triage
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Stadium operations, unified in one command center.
              </h1>
              <p className="mt-4 text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
                StadiumIQ visualizes live density, queues, and surge risk across venues. Start in demo mode with the local
                simulator, then wire in real feeds when your backend integrations are ready.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-2xl transition shadow-[0_0_18px_rgba(37,99,235,0.35)] inline-flex items-center justify-center"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <Link
                  href="/signup"
                  className="glass-panel border border-white/10 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-2xl transition inline-flex items-center justify-center"
                >
                  Request access
                </Link>
              </div>
            </div>

            <div className="glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
              <div className="relative">
                <div className="text-white font-semibold text-lg">What you get</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FeatureCard
                    icon={<Map className="h-5 w-5 text-primary" />}
                    title="Venue Map"
                    desc="Interactive stadium map with live zone overlays."
                  />
                  <FeatureCard
                    icon={<ShieldAlert className="h-5 w-5 text-primary" />}
                    title="Incidents"
                    desc="Live surge alerts with triage context and actions."
                  />
                  <FeatureCard
                    icon={<BarChart3 className="h-5 w-5 text-primary" />}
                    title="Analytics"
                    desc="Trends + density distribution charts from realtime samples."
                  />
                  <FeatureCard
                    icon={<Sparkles className="h-5 w-5 text-primary" />}
                    title="AI Engine"
                    desc="Mock inference pipelines ready to replace with real models."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Stadiums in India</h2>
              <p className="text-slate-400 mt-2 text-sm">
                Select a venue inside the dashboard to scope the realtime feed.
              </p>
            </div>
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Sign in to select
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STADIUMS_INDIA.slice(0, 12).map((s) => (
              <div key={s.id} className="glass-panel border border-white/10 rounded-2xl p-4 hover:bg-white/5 transition">
                <div className="text-white font-semibold">{s.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {s.city}, {s.state}
                  {s.capacity ? ` • ${s.capacity.toLocaleString()} cap` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 text-sm text-slate-400">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div>© {new Date().getFullYear()} StadiumIQ (demo)</div>
            <div className="flex gap-4">
              <Link href="/login" className="hover:text-slate-200 transition">
                Sign in
              </Link>
              <Link href="/signup" className="hover:text-slate-200 transition">
                Create account
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="w-10 h-10 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 text-white font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-400 leading-relaxed">{desc}</div>
    </div>
  );
}

