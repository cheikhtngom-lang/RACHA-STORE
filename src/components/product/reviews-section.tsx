"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Product, ProductReview } from "@/lib/types";
import { Rating } from "@/components/shared/rating";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

function distributionFor(rating: number) {
  const base = [2, 3, 8, 30, 57];
  if (rating >= 4.7) return [1, 1, 3, 15, 80];
  if (rating >= 4.3) return [1, 2, 6, 26, 65];
  if (rating >= 4.0) return [2, 4, 10, 34, 50];
  return base;
}

export function ReviewsSection({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews ?? []);
  const [formOpen, setFormOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const distribution = distributionFor(product.rating);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author || !title || !body) return;
    const newReview: ProductReview = {
      id: `local-${Date.now()}`,
      author,
      rating: draftRating,
      date: new Date().toISOString().slice(0, 10),
      title,
      body,
      verified: false,
    };
    setReviews((r) => [newReview, ...r]);
    setFormOpen(false);
    setAuthor("");
    setTitle("");
    setBody("");
    setDraftRating(5);
    toast.success("Merci pour votre avis !", { description: "Votre retour a bien été publié." });
  }

  return (
    <div id="avis" className="grid lg:grid-cols-[280px_1fr] gap-12">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl text-ink">{product.rating.toFixed(1)}</span>
          <span className="text-stone-light text-sm">/ 5</span>
        </div>
        <Rating value={product.rating} className="mt-2" />
        <p className="text-xs text-stone-light mt-1">{product.reviewCount} avis</p>

        <div className="flex flex-col gap-2 mt-6">
          {distribution.map((pct, i) => {
            const stars = 5 - i;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs text-stone-light">
                <span className="w-2">{stars}</span>
                <Star size={11} className="fill-gold text-gold shrink-0" />
                <div className="h-1 flex-1 bg-line overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="mt-8 w-full" onClick={() => setFormOpen(true)}>
          Donner mon avis
        </Button>
      </div>

      <div>
        {reviews.length === 0 ? (
          <p className="text-sm text-stone-light">Soyez le premier·ère à donner votre avis sur cet article.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {reviews.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <Rating value={r.rating} size={12} />
                  <span className="text-xs text-stone-light">{r.date}</span>
                </div>
                <h4 className="text-sm text-ink mt-3">{r.title}</h4>
                <p className="text-sm text-stone leading-relaxed mt-1.5">{r.body}</p>
                <p className="text-xs text-stone-light mt-3">
                  {r.author} {r.verified && <span className="text-gold">· Achat vérifié</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-[92vw] max-w-md p-8">
          <DialogTitle className="font-display text-2xl text-ink mb-6">Donner mon avis</DialogTitle>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <Label>Note</Label>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraftRating(i + 1)}
                    className="cursor-pointer"
                    aria-label={`${i + 1} étoiles`}
                  >
                    <Star
                      size={24}
                      strokeWidth={1.5}
                      className={i + 1 <= draftRating ? "fill-gold text-gold" : "text-stone-light"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-author">Votre nom</Label>
              <Input id="review-author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="review-title">Titre de l&apos;avis</Label>
              <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="review-body">Votre avis</Label>
              <Textarea id="review-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Publier mon avis
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
