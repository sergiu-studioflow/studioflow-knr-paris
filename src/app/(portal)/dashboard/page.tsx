import Image from "next/image";
import Link from "next/link";
import { Brain, ImageIcon, Video, Target, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const liveSystems = [
    {
      name: "Brand Intelligence",
      href: "/brand-intelligence",
      icon: Brain,
      description:
        "The source of truth every AI in this studio reads — each client's brand voice, customer language, products, and compliance rules.",
    },
    {
      name: "Static Ad System",
      href: "/static-ads",
      icon: ImageIcon,
      description:
        "On-brand static creative per client — built from a curated reference library and the client's positioning.",
    },
    {
      name: "Video Generation",
      href: "/video-generation",
      icon: Video,
      description:
        "UGC, B-Roll, and A-Roll videos end-to-end — script in, finished MP4 out, scoped to each client's voice.",
    },
    {
      name: "Competitor Research",
      href: "/competitor-ads",
      icon: Target,
      description:
        "Watch what's working in each client's category — Meta, TikTok, and Instagram in one feed, fashion and beauty first.",
    },
    {
      name: "Research Briefs",
      href: "/research-briefs",
      icon: FileText,
      description:
        "Strategic briefs distilled from competitor research — sprint-ready creative direction, per client.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Branded hero strip */}
      <section className="card-accent animate-fade-up relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-secondary/40 to-background p-8 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_30%,hsla(37,34%,47%,0.10)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="hidden md:flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-card shadow-card ring-1 ring-primary/10">
              <Image
                src="/client-logo.png"
                alt="KNR Paris"
                width={48}
                height={48}
                priority
                className="h-12 w-12 rounded-md"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary/80">
                KNR Paris
              </p>
              <h1 className="mt-2 text-3xl tracking-tight text-foreground sm:text-5xl">
                <span className="font-display text-primary">Creative Studio</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Your daily AI collaborator across every client — brand intel, competitor research, static ads, and video. Built around the way KNR Paris ships work for luxury fashion and beauty.
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/knr-paris-logo.png"
              alt="KNR Paris"
              width={200}
              height={52}
              priority
              className="h-auto w-[200px] opacity-90 invert dark:invert-0"
            />
          </div>
        </div>
      </section>

      {/* System grid */}
      <div>
        <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          Systems
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveSystems.map((system, i) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-accent animate-fade-up group relative rounded-xl border border-border bg-card p-7 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/30"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/30 via-primary/80 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <system.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight text-foreground">
                    {system.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {system.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
