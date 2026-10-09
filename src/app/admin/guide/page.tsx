import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { GUIDE_CHAPTERS, GUIDE_INTRO, richText, type GuideBlock, type GuideChapter } from "@/lib/admin-guide";

// Mode d'emploi de l'administration. Le texte est dans lib/admin-guide.ts,
// partagé avec la version PDF (/admin/guide/pdf).

export const metadata: Metadata = {
  title: "Guide de l'administration",
};

export default function AdminGuidePage() {
  return (
    <>
      <PageHeader
        title="Guide"
        description={GUIDE_INTRO}
        action={
          <Button asChild variant="outline" size="sm">
            <a href="/admin/guide/pdf" download>
              <Download size={15} strokeWidth={1.5} />
              Télécharger en PDF
            </a>
          </Button>
        }
      />

      <div className="grid xl:grid-cols-[220px_1fr] gap-6 items-start">
        <nav aria-label="Sommaire du guide" className="dash-card p-5 xl:sticky xl:top-8">
          <p className="font-sans-wide text-[0.62rem] uppercase text-stone-light mb-3">Sommaire</p>
          <ol className="grid sm:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-1.5 text-sm">
            {GUIDE_CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="text-stone hover:text-gold-light transition-colors">
                  <span className="tabular-nums text-stone-light mr-2">{i + 1}.</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-6 min-w-0">
          {GUIDE_CHAPTERS.map((chapter) => (
            <Chapter key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>
    </>
  );
}

function Chapter({ chapter }: { chapter: GuideChapter }) {
  return (
    <div id={chapter.id} className="scroll-mt-24 xl:scroll-mt-8">
      <Panel
        title={chapter.title}
        action={
          chapter.href && (
            <Link
              href={chapter.href}
              className="group inline-flex items-center gap-1.5 text-xs text-stone-light hover:text-gold-light transition-colors"
            >
              Ouvrir l&apos;onglet
              <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )
        }
      >
        <div className="p-5 sm:p-6 flex flex-col gap-4 text-sm text-stone leading-relaxed max-w-3xl">
          {chapter.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <Rich text={block.text} />
        </p>
      );
    case "heading":
      return <h3 className="font-sans-wide text-[0.65rem] uppercase text-ink pt-2">{block.text}</h3>;
    case "steps":
      return (
        <ol className="list-decimal pl-5 flex flex-col gap-2 marker:text-gold-light marker:tabular-nums">
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </ol>
      );
    case "points":
      return (
        <ul className="list-disc pl-5 flex flex-col gap-2 marker:text-gold-light">
          {block.items.map((item, i) => (
            <li key={i}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <p className="border-l-2 border-gold pl-4 text-ink">
          <Rich text={block.text} />
        </p>
      );
  }
}

function Rich({ text }: { text: string }) {
  return richText(text).map((segment, i) =>
    segment.bold ? (
      <b key={i} className="font-medium text-ink">
        {segment.text}
      </b>
    ) : (
      segment.text
    )
  );
}
