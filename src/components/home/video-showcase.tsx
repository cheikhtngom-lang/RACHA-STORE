"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeVideo } from "@/lib/home-videos";
import { cn } from "@/lib/utils";

const CONTROL =
  "h-10 w-10 flex items-center justify-center border border-cream/30 text-cream hover:bg-cream hover:text-ink-dark transition-colors cursor-pointer";

// Les vidéos de l'accueil, enchaînées comme un petit film (comme l'espace
// publicitaire de mecanopro) : chacune passe en entier, montrée sans coupe sur
// un halo flou de ses propres couleurs, puis la suivante démarre ; une vidéo
// seule tourne en boucle. Muettes tant que le visiteur n'active pas le son, et
// lues seulement quand la section est à l'écran. Qui a demandé moins
// d'animations les lance lui-même. Seule la vidéo en cours se télécharge.
export function VideoShowcase({ videos }: { videos: HomeVideo[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Choix du visiteur (bouton pause / lecture) ; null tant qu'il n'a rien demandé.
  const [stopped, setStopped] = useState<boolean | null>(null);
  const [muted, setMuted] = useState(true);
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const many = videos.length > 1;
  const current = videos[index];
  const paused = stopped ?? reducedMotion;
  const playing = inView && !paused;

  const step = useCallback(
    (direction: 1 | -1) => {
      setIndex((i) => (i + direction + videos.length) % videos.length);
      setProgress(0);
    },
    [videos.length]
  );

  function show(i: number) {
    setIndex(i);
    setProgress(0);
  }

  // Halo : l'image en cours, réduite à quelques pixels puis agrandie en flou.
  const paintGlow = useCallback(() => {
    const v = video.current;
    const c = glow.current;
    if (v && c && v.readyState >= 2) c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
  }, []);

  // Lecture dès que près de la moitié de la section est à l'écran, pause sinon.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        setInView(!!entry?.isIntersecting);
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pendant la lecture, le halo suit les couleurs de la vidéo. Un navigateur qui
  // refuse la lecture automatique : la vidéo reste en pause, le bouton la lance.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!playing) {
      v.pause();
      return;
    }
    v.play().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "NotAllowedError") setStopped(true);
    });
    const t = window.setInterval(paintGlow, 200);
    return () => window.clearInterval(t);
  }, [playing, index, paintGlow]);

  // React ne tient pas à jour la propriété muted d'une vidéo après le premier rendu.
  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted, index]);

  if (!current) return null;

  return (
    <section
      ref={section}
      aria-roledescription="carrousel"
      aria-label="Vidéos Racha Store"
      className="relative overflow-hidden bg-ink-dark touch-pan-y"
      // Téléphone : un glissement du doigt passe à la vidéo suivante ou précédente.
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const from = touch.current;
        const t = e.changedTouches[0];
        touch.current = null;
        if (!many || !from || !t) return;
        const dx = t.clientX - from.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - from.y) * 1.5) step(dx < 0 ? 1 : -1);
      }}
      // Clavier : flèches gauche et droite quand un bouton de la section a le focus.
      onKeyDown={(e) => {
        if (!many || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
        e.preventDefault();
        step(e.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <div aria-hidden className="absolute inset-0">
        <canvas ref={glow} width={16} height={9} className="absolute inset-0 h-full w-full scale-125 blur-3xl saturate-150 opacity-70" />
        {/* Voile pour lire le texte : sous la vidéo sur téléphone, à gauche sur ordinateur. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-dark/40 via-ink-dark/70 to-ink-dark lg:bg-gradient-to-r lg:from-ink-dark lg:via-ink-dark/75 lg:to-ink-dark/35" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:items-center">
        <div className="lg:order-2">
          <div className="relative aspect-[4/5] max-h-[70svh] w-full sm:aspect-video lg:aspect-auto lg:h-[32rem] lg:max-h-none">
            <video
              key={current.id}
              ref={video}
              src={current.video_url}
              poster={current.poster_url ?? undefined}
              muted
              playsInline
              loop={!many}
              preload={inView ? "auto" : "none"}
              aria-label={current.title || "Vidéo Racha Store"}
              onLoadedData={paintGlow}
              onSeeked={paintGlow}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
              onEnded={many ? () => step(1) : undefined}
              className="absolute inset-0 h-full w-full object-contain"
            >
              Votre navigateur ne lit pas cette vidéo.
            </video>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStopped(!paused)}
              aria-label={paused ? "Lire la vidéo" : "Mettre la vidéo en pause"}
              className={CONTROL}
            >
              {paused ? <Play size={16} strokeWidth={1.5} /> : <Pause size={16} strokeWidth={1.5} />}
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className={CONTROL}
            >
              {muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            </button>
            {many && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Vidéo précédente" className={CONTROL}>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Vidéo suivante" className={CONTROL}>
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
                {/* Une barre par vidéo : celle en cours avance avec la lecture. Un clic choisit la vidéo. */}
                <div className="ml-2 flex flex-1 min-w-[120px] gap-1.5">
                  {videos.map((v, i) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => show(i)}
                      aria-label={`Vidéo ${i + 1} sur ${videos.length}`}
                      aria-current={i === index}
                      className="flex h-10 flex-1 items-center cursor-pointer"
                    >
                      <span className="block h-0.5 w-full overflow-hidden bg-cream/25">
                        <span
                          className="block h-full origin-left bg-gold-light transition-transform duration-200 ease-linear"
                          style={{ transform: `scaleX(${i < index ? 1 : i === index ? progress : 0})` }}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Les textes occupent la même case : la hauteur ne saute pas d'une vidéo à l'autre. */}
        <div className="grid lg:order-1">
          {videos.map((v, i) => (
            <div
              key={v.id}
              inert={i !== index}
              className={cn(
                "[grid-area:1/1] transition-opacity duration-500 ease-out",
                i === index ? "opacity-100" : "opacity-0"
              )}
            >
              <p className="eyebrow text-gold-light mb-5">{many ? `Vidéo ${i + 1} / ${videos.length}` : "En vidéo"}</p>
              {v.title && <h2 className="font-display text-3xl sm:text-5xl text-cream leading-tight max-w-xl">{v.title}</h2>}
              {v.body && <p className="mt-5 max-w-md text-cream/75 text-sm sm:text-base leading-relaxed">{v.body}</p>}
              {v.button_label && v.button_url && (
                <Button asChild variant="gold" size="lg" className="mt-8">
                  {v.button_url.startsWith("/") ? (
                    <Link href={v.button_url}>{v.button_label}</Link>
                  ) : (
                    <a href={v.button_url} target="_blank" rel="noopener noreferrer">
                      {v.button_label}
                    </a>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
