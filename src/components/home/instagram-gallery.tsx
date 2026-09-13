import Image from "next/image";
import { InstagramIcon } from "@/components/shared/social-icons";
import { img, pools } from "@/data/images";

const shots = [
  pools.apparel[4],
  pools.bags[1],
  pools.shoes[0],
  pools.jewelry[2],
  pools.beauty[0],
  pools.apparel[16],
];

export function InstagramGallery() {
  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {shots.map((id, i) => (
          <a
            key={i}
            href="#"
            className="group relative aspect-square overflow-hidden bg-sand block"
            aria-label="Voir sur Instagram"
          >
            <Image
              src={img(id, 500, 500)}
              alt=""
              fill
              sizes="200px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink-dark/0 group-hover:bg-ink-dark/40 transition-colors flex items-center justify-center">
              <InstagramIcon
                size={20}
                className="text-cream opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
