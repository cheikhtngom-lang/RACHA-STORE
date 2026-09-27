export function img(id: string, w = 1200, h?: number) {
  // Local files (downloaded stock photos) are referenced directly:
  // Next/Image optimizes them on the fly, no query params needed.
  if (id.startsWith("/")) return id;

  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(w),
    q: "80",
  });
  if (h) params.set("h", String(h));
  return `https://images.unsplash.com/photo-${id}?${params.toString()}`;
}

export const people = {
  smilingWoman1: "/stock/smiling-woman-1.jpg",
  smilingWoman2: "/stock/smiling-woman-2.jpg",
  smilingWoman3: "/stock/smiling-woman-3.jpg",
  smilingWoman4: "/stock/smiling-woman-4.jpg",
  womanPortraitEarrings: "/stock/woman-portrait-earrings.jpg",
  manProfessional1: "/stock/man-professional-1.jpg",
  manProfessional2: "/stock/man-professional-2.jpg",
  manReading: "/stock/man-reading.jpg",
  fashionWomanEditorial: "/stock/fashion-woman-editorial.jpg",
  runwayDuo: "/stock/runway-duo.jpg",
  manJewelry: "/stock/man-jewelry.jpg",
  youngManPolo: "/stock/young-man-polo.jpg",
  coupleStreet: "/stock/couple-street.jpg",
  friendsJumping: "/stock/friends-jumping.jpg",
  familyPark1: "/stock/family-park-1.jpg",
  fatherDaughter: "/stock/father-daughter.jpg",
  handsBracelets: "/stock/hands-bracelets.jpg",
  familyPark2: "/stock/family-park-2.jpg",
};

export const pools = {
  apparel: [
    "1509319117193-57bab727e09d",
    "1490481651871-ab68de25d43d",
    "1445205170230-053b83016050",
    people.runwayDuo,
    people.manJewelry,
    "1489987707025-afc232f7ea0f",
    "1441984904996-e0b6ba687e04",
    "1492707892479-7bc8d5a4ee93",
    "1441986300917-64674bd600d8",
    people.youngManPolo,
    people.coupleStreet,
    "1567401893414-76b7b1e5a7a5",
    people.friendsJumping,
    people.familyPark1,
    people.fatherDaughter,
    people.handsBracelets,
    people.familyPark2,
  ],
  shoes: [
    "1543163521-1bf539c55dd2",
    "1560769629-975ec94e6a86",
    "1595950653106-6c9ebd614d3a",
    "1560343090-f0409e92791a",
  ],
  beauty: [
    "1617897903246-719242758050",
    "1573575155376-b5010099301b",
    "1596462502278-27bfdc403348",
  ],
  bags: [
    "1590874103328-eac38a683ce7",
    "1584917865442-de89df76afd3",
    "1614179689702-355944cd0918",
  ],
  jewelry: [
    "1611085583191-a3b181a88401",
    "1535632066927-ab7c9ab60908",
    "1599643478518-a784e5dc4c8f",
    "1611591437281-460bfbe1220a",
    "1515562141207-7a88fb7ce338",
    "1573408301185-9146fe634ad0",
    "1600721391776-b5cd0e0048f9",
  ],
  portraits: [
    people.smilingWoman1,
    people.smilingWoman2,
    people.smilingWoman3,
    people.smilingWoman4,
    people.womanPortraitEarrings,
    people.manProfessional1,
    people.manProfessional2,
    people.manReading,
    people.fashionWomanEditorial,
  ],
};
