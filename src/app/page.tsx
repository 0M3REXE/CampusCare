import Image from 'next/image'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(59,130,246,0.25),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Support students. 24/7. With care.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-foreground/80">
                CampusCare is an AI-powered wellbeing assistant for universities. It listens, guides, and connects students to resources—safely and affordably.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a href="#get-started" className="rounded-full bg-blue-600 text-white px-5 py-3 text-sm font-medium shadow hover:bg-blue-700 transition-colors">Get started</a>
                <a href="#features" className="rounded-full border px-5 py-3 text-sm font-medium border-black/10 dark:border-white/15 hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors">Learn more</a>
              </div>
              <div className="mt-6 text-xs text-foreground/60">Free to try • Works on web • Private by design</div>
            </div>
            <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-gradient-to-br from-white/60 to-white/20 dark:from-black/20 dark:to-black/10 shadow-sm">
              <div className="relative aspect-video w-full">
                <Image
                  src="/img.png"
                  alt="CampusCare app preview"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">What you get</h2>
          <p className="mt-2 text-foreground/70">A simple toolkit to support wellbeing on campus.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'AI chat that listens', desc: 'Empathetic, resource-aware conversations designed for student wellbeing.' },
            { title: 'Resource routing', desc: 'Match students to campus services, peer support, and emergency guidance.' },
            { title: 'Risk awareness', desc: 'Lightweight risk flags to route urgent cases responsibly.' },
            { title: 'Privacy first', desc: 'No tracking of sensitive content by default. You control data policies.' },
            { title: 'Near-zero cost', desc: 'Built to run on free tiers with minimal overhead.' },
            { title: 'Easy deployment', desc: 'Ship on Vercel in minutes. Works with Supabase if you need persistence.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background/60 backdrop-blur">
              <div className="size-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 mb-4" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Urgent help (Contact options) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-2 grid sm:grid-cols-2 gap-4">
          <a
            href="tel:+919152987821"
            className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background/60 backdrop-blur hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors"
            aria-label="Call India Suicide Hotline at 9152987821"
          >

            <h3 className="font-semibold">India Suicide Hotline</h3>
            <p className="mt-1 text-lg font-mono tracking-wide">9152987821</p>
          </a>
          <a
            href="tel:1-800 891 4416"
            className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background/60 backdrop-blur hover:bg-black/[.04] dark:hover:bg-white/[.06] transition-colors"
            aria-label="Telemanas Hotline"
          >

            <h3 className="font-semibold">Telemanas Hotline</h3>
            <p className="mt-1 text-lg font-mono tracking-wide">1-800 891 4416</p>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to try CampusCare?</h3>
              <p className="mt-2 text-white/85">Start with the basic chat and add features as you go.</p>
            </div>
            <div className="flex md:justify-end">
              <a href="#" className="rounded-full bg-white text-blue-700 px-6 py-3 text-sm font-medium hover:bg-white/90 transition-colors">Open chat</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
