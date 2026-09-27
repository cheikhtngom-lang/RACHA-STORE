import Image from "next/image";
import { img, pools } from "@/data/images";
import { social } from "@/lib/site";

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
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {shots.map((id, i) => (
        <a
          key={i}
          href={social.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden bg-sand block"
          aria-label={`Voir ${social.instagram.handle} sur Instagram`}
        >
          <Image
            src={img(id, 500, 500)}
            alt=""
            fill
            sizes="200px"
            className="object-cover transition-opacity duration-300 group-hover:opacity-85"
          />
        </a>
      ))}
    </div>
  );
}
