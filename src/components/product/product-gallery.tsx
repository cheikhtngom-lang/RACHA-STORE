"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-3 shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden bg-sand border transition-colors cursor-pointer",
                active === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt={`${name}, vue ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setLightboxOpen(true)}
        className="group relative flex-1 aspect-[4/5] overflow-hidden bg-sand cursor-zoom-in"
        aria-label="Agrandir l'image"
      >
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute bottom-4 right-4 h-9 w-9 flex items-center justify-center bg-cream/90 text-ink opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} strokeWidth={1.5} />
        </span>
      </button>

      <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-dark/90 data-[state=open]:animate-in data-[state=open]:fade-in" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-6 outline-none">
            <VisuallyHidden>
              <Dialog.Title>{name}</Dialog.Title>
            </VisuallyHidden>
            <div className="relative w-full max-w-3xl aspect-[4/5]">
              <Image src={images[active]} alt={name} fill sizes="80vw" className="object-contain" />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
                  className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-cream hover:text-gold cursor-pointer"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={26} strokeWidth={1.2} />
                </button>
                <button
                  onClick={() => setActive((a) => (a + 1) % images.length)}
                  className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-cream hover:text-gold cursor-pointer"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={26} strokeWidth={1.2} />
                </button>
              </>
            )}
            <Dialog.Close className="absolute right-5 top-5 text-cream hover:text-gold cursor-pointer">
              <X size={24} strokeWidth={1.2} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
