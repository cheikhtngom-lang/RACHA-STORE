-- Racha Store : données de départ
-- À exécuter après supabase/migrations/20260927120000_initial_schema.sql.
--
-- Les catégories correspondent à la navigation du site.
-- Les PRODUITS SONT DES EXEMPLES (photos de banque d'images) : ils servent à
-- tester le site branché sur Supabase. Remplacez-les par vos vrais articles
-- avant l'ouverture. Pour tous les supprimer d'un coup :
--   delete from public.products;

insert into public.categories (slug, name, description, image_url, position) values
  ('pret-a-porter', 'Prêt-à-porter', 'Manteaux, robes, chemises, maille, vestes, jupes et pantalons.', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80&h=1500', 0),
  ('sacs-maroquinerie', 'Sacs & Maroquinerie', 'Cabas, sacs bandoulière et sacs de voyage en cuir.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80&h=1500', 1),
  ('chaussures', 'Chaussures', 'Escarpins, sneakers et bottines, du 36 au 42.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80&h=1500', 2),
  ('bijoux-accessoires', 'Bijoux & Accessoires', 'Colliers, boucles d''oreilles, ceintures et foulards en soie.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80&h=1500', 3),
  ('beaute-parfums', 'Beauté & Parfums', 'Eau de parfum, bougies parfumées et soins visage.', 'https://images.unsplash.com/photo-1573575155376-b5010099301b?auto=format&fit=crop&w=1200&q=80&h=1500', 4);

insert into public.products (
  slug, sku, name, category_id, subcategory, price, compare_at_price,
  short_description, description, details, materials, care, images, colors, sizes,
  stock, is_new, is_best_seller, is_limited, position
) values
  (
    'manteau-double-face-camel', 'RS-MAN-001', 'Manteau double-face en laine',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Manteaux', 452000, 583000,
    'Un manteau structuré en laine double-face, taillé pour l''hiver.',
    'Façonné dans une laine double-face d''exception, ce manteau incarne l''élégance intemporelle de la maison. Sa coupe épurée et ses lignes architecturales subliment chaque silhouette, tandis que la doublure en soie apporte un confort absolu au quotidien.',
    array['Laine double-face 90% laine, 10% cachemire', 'Doublure intérieure en soie', 'Fermeture croisée à boutons corne', 'Poches passepoilées', 'Fabriqué en Europe']::text[],
    '90% laine, 10% cachemire, doublure 100% soie', 'Nettoyage à sec uniquement',
    array['https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Camel","hex":"#C08B4B"},{"name":"Noir","hex":"#1A1A1A"},{"name":"Beige","hex":"#D8CBB0"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    14, false, true, false, 0
  ),
  (
    'robe-midi-soie-ivoire', 'RS-ROB-002', 'Robe midi en soie',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Robes', 275000, null,
    'Une robe fluide en soie pure, coupe bias intemporelle.',
    'Cette robe midi est taillée dans une soie fluide qui épouse le corps avec grâce. La coupe en biais, signature de la maison, offre un tombé impeccable pour les journées comme pour les soirées.',
    array['100% soie mûrier', 'Coupe bias', 'Fermeture éclair invisible au dos', 'Ourlet fait main']::text[],
    '100% soie', 'Nettoyage à sec recommandé',
    array['/stock/runway-duo.jpg', '/stock/man-jewelry.jpg']::text[],
    '[{"name":"Ivoire","hex":"#F3ECDD"},{"name":"Bordeaux","hex":"#6E2A32"},{"name":"Bleu nuit","hex":"#1F2A44"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    9, true, false, false, 1
  ),
  (
    'chemise-lin-blanc', 'RS-CHE-003', 'Chemise oversize en lin',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Chemises', 128000, null,
    'Chemise ample en lin lavé, fraîcheur et allure décontractée.',
    'Coupée dans un lin lavé d''une grande douceur, cette chemise oversize apporte une allure décontractée et chic à toutes les tenues. Le col ouvert et les poignets larges signent son caractère estival.',
    array['100% lin lavé', 'Coupe oversize', 'Col chemise classique', 'Boutons nacre']::text[],
    '100% lin', 'Lavage machine 30°C',
    array['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Ivoire","hex":"#F3ECDD"},{"name":"Vert sauge","hex":"#8A9A82"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    22, false, false, false, 2
  ),
  (
    'pull-cachemire-col-rond', 'RS-PUL-004', 'Pull en cachemire col rond',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Maille', 203000, null,
    'Cachemire pur, tricot fin pour une douceur incomparable.',
    'Un essentiel en cachemire pur, tricoté finement pour offrir chaleur et légèreté. Sa coupe classique et son col rond en font une pièce polyvalente, à associer aussi bien avec un tailleur qu''un jean brut.',
    array['100% cachemire grade A', 'Tricot fin', 'Col rond côtelé', 'Coupe classique']::text[],
    '100% cachemire', 'Lavage à la main, à plat',
    array['https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Beige","hex":"#D8CBB0"},{"name":"Noir","hex":"#1A1A1A"},{"name":"Rose poudré","hex":"#E3C6C1"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    18, false, true, false, 3
  ),
  (
    'tailleur-blazer-structure', 'RS-BLZ-005', 'Blazer structuré',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Vestes', 314000, null,
    'Blazer cintré à l''épaule structurée, tailleur signature.',
    'Pièce maîtresse du vestiaire, ce blazer à l''épaule structurée et à la taille cintrée redéfinit l''élégance professionnelle. Se porte seul ou avec le pantalon assorti pour un tailleur complet.',
    array['Laine stretch 4 poches', 'Épaulettes structurées', 'Doublure intérieure', 'Boutonnage simple']::text[],
    '98% laine, 2% élasthanne', 'Nettoyage à sec',
    array['/stock/young-man-polo.jpg', '/stock/couple-street.jpg']::text[],
    '[{"name":"Noir","hex":"#1A1A1A"},{"name":"Bleu nuit","hex":"#1F2A44"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    11, true, false, false, 4
  ),
  (
    'jupe-plissee-satin', 'RS-JUP-006', 'Jupe plissée en satin',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Jupes', 170000, null,
    'Plissé soleil en satin fluide, mouvement et légèreté.',
    'Le plissé soleil confère à cette jupe un mouvement gracieux à chaque pas. Le satin fluide capte la lumière avec subtilité, pour une pièce aussi élégante le jour que le soir.',
    array['Satin plissé soleil', 'Taille haute élastiquée', 'Longueur midi', 'Doublure intégrale']::text[],
    '100% polyester recyclé (satin)', 'Nettoyage à sec',
    array['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1400&q=80&h=1750', '/stock/friends-jumping.jpg']::text[],
    '[{"name":"Terracotta","hex":"#B5623A"},{"name":"Bleu nuit","hex":"#1F2A44"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    16, false, false, false, 5
  ),
  (
    'trench-coat-beige', 'RS-TRC-007', 'Trench-coat classique',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Manteaux', 386000, null,
    'Le trench iconique en gabardine imperméabilisée.',
    'Réinterprétation contemporaine du trench iconique, cette pièce en gabardine imperméabilisée conjugue élégance britannique et coupe actuelle. Ceinture ajustable et patte d''épaule signent son héritage.',
    array['Gabardine de coton imperméabilisée', 'Ceinture amovible', 'Doublure à carreaux', 'Patte d''épaule']::text[],
    '100% coton', 'Nettoyage à sec',
    array['/stock/family-park-1.jpg', '/stock/father-daughter.jpg']::text[],
    '[{"name":"Beige","hex":"#D8CBB0"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    7, false, true, false, 6
  ),
  (
    'pantalon-tailleur-laine', 'RS-PAN-008', 'Pantalon tailleur en laine',
    (select id from public.categories where slug = 'pret-a-porter'),
    'Pantalons', 157000, null,
    'Coupe droite, taille haute, pince impeccable.',
    'Taillé dans une laine fluide, ce pantalon à coupe droite et taille haute affine la silhouette avec une élégance sans effort. La pince avant assure une chute impeccable.',
    array['Laine fluide', 'Taille haute', 'Coupe droite', 'Fermeture zip et bouton']::text[],
    '96% laine, 4% élasthanne', 'Nettoyage à sec',
    array['/stock/hands-bracelets.jpg', '/stock/family-park-2.jpg']::text[],
    '[{"name":"Noir","hex":"#1A1A1A"},{"name":"Bleu nuit","hex":"#1F2A44"},{"name":"Camel","hex":"#C08B4B"}]'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL']::text[],
    20, false, false, false, 7
  ),
  (
    'sac-cabas-cuir-noir', 'RS-SAC-009', 'Cabas en cuir grainé',
    (select id from public.categories where slug = 'sacs-maroquinerie'),
    null, 341000, null,
    'Cabas structuré en cuir grainé, façonné à la main.',
    'Façonné à la main par nos artisans maroquiniers, ce cabas en cuir grainé pleine fleur allie robustesse et raffinement. Son intérieur compartimenté accueille l''essentiel du quotidien avec organisation.',
    array['Cuir de vachette pleine fleur', 'Anses portées main et épaule', 'Fermoir aimanté', 'Intérieur compartimenté']::text[],
    '100% cuir pleine fleur', 'Entretien avec crème nourrissante pour cuir',
    array['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Noir","hex":"#1A1A1A"},{"name":"Camel","hex":"#C08B4B"},{"name":"Bordeaux","hex":"#6E2A32"}]'::jsonb,
    '{}'::text[],
    12, false, true, false, 8
  ),
  (
    'sac-bandouliere-mini', 'RS-SAC-010', 'Mini sac bandoulière',
    (select id from public.categories where slug = 'sacs-maroquinerie'),
    null, 223000, null,
    'Format mini, chaîne dorée amovible, cuir souple.',
    'Compact et raffiné, ce mini sac se porte en bandoulière grâce à sa chaîne dorée amovible. Le cuir souple et la finition soignée en font un compagnon idéal pour les sorties du soir.',
    array['Cuir d''agneau souple', 'Chaîne amovible finition dorée', 'Fermoir signature', 'Doublure suédine']::text[],
    '100% cuir d''agneau', 'Éviter le contact prolongé avec l''eau',
    array['https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Doré","hex":"#C9A567"},{"name":"Noir","hex":"#1A1A1A"},{"name":"Rose poudré","hex":"#E3C6C1"}]'::jsonb,
    '{}'::text[],
    15, true, false, false, 9
  ),
  (
    'sac-week-end-cuir', 'RS-SAC-011', 'Sac week-end en cuir',
    (select id from public.categories where slug = 'sacs-maroquinerie'),
    null, 400000, null,
    'Le compagnon de voyage en cuir patiné.',
    'Généreux et robuste, ce sac week-end en cuir patiné traverse les années avec élégance. Sa large ouverture zippée et ses anses renforcées en font l''allié parfait des escapades.',
    array['Cuir patiné vieilli', 'Fond renforcé', 'Bandoulière amovible', 'Poche extérieure zippée']::text[],
    '100% cuir pleine fleur', 'Entretien avec crème nourrissante pour cuir',
    array['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Camel","hex":"#C08B4B"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
    '{}'::text[],
    5, false, false, true, 10
  ),
  (
    'escarpins-cuir-noir', 'RS-CHA-012', 'Escarpins en cuir verni',
    (select id from public.categories where slug = 'chaussures'),
    null, 190000, null,
    'Talon 8cm, bout pointu, cuir verni miroir.',
    'L''escarpin signature de la maison, en cuir verni miroir. Le talon de 8cm et le bout pointu allongent la silhouette pour une allure résolument élégante, du bureau aux soirées.',
    array['Cuir verni', 'Talon 8cm', 'Semelle intérieure cuir', 'Bout pointu']::text[],
    'Tige cuir verni, semelle cuir', 'Chiffon doux, éviter l''humidité',
    array['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Noir","hex":"#1A1A1A"},{"name":"Bordeaux","hex":"#6E2A32"}]'::jsonb,
    array['36', '37', '38', '39', '40', '41', '42']::text[],
    13, false, true, false, 11
  ),
  (
    'sneakers-cuir-blanc', 'RS-CHA-013', 'Sneakers minimalistes',
    (select id from public.categories where slug = 'chaussures'),
    null, 138000, null,
    'Silhouette épurée en cuir souple, semelle confort.',
    'Dans la pure tradition du minimalisme, cette sneaker en cuir souple mise sur des lignes épurées et une semelle confort pensée pour durer. Un essentiel du vestiaire casual-chic.',
    array['Cuir pleine fleur', 'Semelle en caoutchouc', 'Doublure textile respirante', 'Lacets coton ciré']::text[],
    'Tige cuir, semelle caoutchouc', 'Chiffon humide, cirage incolore',
    array['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Ivoire","hex":"#F3ECDD"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
    array['36', '37', '38', '39', '40', '41', '42']::text[],
    24, true, false, false, 12
  ),
  (
    'bottines-daim-camel', 'RS-CHA-014', 'Bottines en daim',
    (select id from public.categories where slug = 'chaussures'),
    null, 210000, null,
    'Daim souple, talon bloc 5cm, zip intérieur.',
    'Ces bottines en daim souple associent confort et caractère. Le talon bloc de 5cm assure une stabilité parfaite tandis que le zip intérieur facilite l''enfilage.',
    array['Daim pleine fleur', 'Talon bloc 5cm', 'Zip intérieur', 'Semelle antidérapante']::text[],
    'Tige daim, semelle caoutchouc', 'Brosse spéciale daim',
    array['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Camel","hex":"#C08B4B"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
    array['36', '37', '38', '39', '40', '41', '42']::text[],
    10, false, false, false, 13
  ),
  (
    'collier-chaine-dore', 'RS-BIJ-015', 'Collier chaîne plaqué or',
    (select id from public.categories where slug = 'bijoux-accessoires'),
    null, 95000, null,
    'Plaqué or 18 carats, maille forçat fine.',
    'Ce collier à maille forçat fine, plaqué or 18 carats, se porte seul ou superposé pour un effet layering raffiné. Une pièce intemporelle qui traverse les saisons.',
    array['Plaqué or 18 carats sur laiton', 'Longueur 45cm + extension 5cm', 'Fermoir mousqueton', 'Hypoallergénique']::text[],
    'Laiton plaqué or 18 carats', 'Éviter le contact avec parfum et eau',
    array['https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Doré","hex":"#C9A567"},{"name":"Argenté","hex":"#C7C7C7"}]'::jsonb,
    '{}'::text[],
    30, false, true, false, 14
  ),
  (
    'boucles-oreilles-perles', 'RS-BIJ-016', 'Boucles d''oreilles perles',
    (select id from public.categories where slug = 'bijoux-accessoires'),
    null, 64000, null,
    'Perles de culture montées sur argent 925.',
    'Ces boucles d''oreilles associent la pureté de la perle de culture à la finesse d''une monture en argent 925. Une élégance discrète, parfaite en toutes occasions.',
    array['Perles de culture d''eau douce', 'Argent 925 rhodié', 'Fermoir poussette', 'Diamètre perle 8mm']::text[],
    'Argent 925, perles de culture', 'Conserver dans son écrin',
    array['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Ivoire","hex":"#F3ECDD"},{"name":"Doré","hex":"#C9A567"}]'::jsonb,
    '{}'::text[],
    25, true, false, false, 15
  ),
  (
    'ceinture-cuir-boucle-doree', 'RS-BIJ-017', 'Ceinture en cuir, boucle dorée',
    (select id from public.categories where slug = 'bijoux-accessoires'),
    null, 79000, null,
    'Cuir pleine fleur, boucle signature dorée.',
    'Élément clé de tout vestiaire, cette ceinture en cuir pleine fleur est signée par une boucle dorée gravée. Elle structure la taille avec une élégance discrète.',
    array['Cuir pleine fleur 3cm', 'Boucle laiton doré', 'Gravure signature', '5 crans de réglage']::text[],
    '100% cuir', 'Entretien avec crème nourrissante pour cuir',
    array['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Noir","hex":"#1A1A1A"},{"name":"Camel","hex":"#C08B4B"},{"name":"Bordeaux","hex":"#6E2A32"}]'::jsonb,
    array['85', '90', '95', '100']::text[],
    40, false, false, false, 16
  ),
  (
    'foulard-soie-imprime', 'RS-BIJ-018', 'Foulard en soie imprimée',
    (select id from public.categories where slug = 'bijoux-accessoires'),
    null, 108000, null,
    'Twill de soie, imprimé exclusif signé Racha Store.',
    'Réalisé en twill de soie, ce foulard arbore un imprimé exclusif imaginé par notre atelier. Noué au cou, en headband ou à l''anse d''un sac, il signe chaque tenue avec caractère.',
    array['Twill de soie 90x90cm', 'Imprimé exclusif', 'Ourlets roulottés main', 'Sérigraphie 12 couleurs']::text[],
    '100% soie', 'Nettoyage à sec',
    array['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[{"name":"Terracotta","hex":"#B5623A"},{"name":"Bleu nuit","hex":"#1F2A44"},{"name":"Vert sauge","hex":"#8A9A82"}]'::jsonb,
    '{}'::text[],
    8, false, false, true, 17
  ),
  (
    'eau-de-parfum-signature', 'RS-PAR-019', 'Eau de Parfum Signature',
    (select id from public.categories where slug = 'beaute-parfums'),
    null, 115000, null,
    'Ambre, bois de santal et fleur d''oranger. 50 ml.',
    'Composée par un parfumeur français, notre Eau de Parfum Signature ouvre sur une fleur d''oranger lumineuse, se love dans un cœur de jasmin et se dépose sur un fond d''ambre et de bois de santal.',
    array['50ml', 'Notes: fleur d''oranger, jasmin, ambre, santal', 'Tenue 8h+', 'Flacon rechargeable']::text[],
    'Flacon verre, vaporisateur laiton', 'Conserver à l''abri de la lumière',
    array['https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1573575155376-b5010099301b?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[]'::jsonb,
    '{}'::text[],
    45, false, true, false, 18
  ),
  (
    'bougie-parfumee-santal', 'RS-PAR-020', 'Bougie parfumée Santal & Cèdre',
    (select id from public.categories where slug = 'beaute-parfums'),
    null, 45000, null,
    'Cire de soja, mèche coton, 45h de combustion.',
    'Un sillage boisé et chaleureux pour parfumer son intérieur. Coulée à la main dans de la cire de soja, cette bougie offre 45 heures de combustion propre et homogène.',
    array['220g de cire de soja', 'Mèche coton sans plomb', '45h de combustion', 'Contenant en verre réutilisable']::text[],
    'Cire de soja, verre', 'Mèche à tailler avant chaque allumage',
    array['https://images.unsplash.com/photo-1573575155376-b5010099301b?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[]'::jsonb,
    '{}'::text[],
    60, true, false, false, 19
  ),
  (
    'coffret-soins-visage', 'RS-PAR-021', 'Coffret rituel visage',
    (select id from public.categories where slug = 'beaute-parfums'),
    null, 95000, null,
    'Huile démaquillante, sérum et crème hydratante.',
    'Un rituel de soin complet pensé pour révéler l''éclat naturel de la peau : huile démaquillante, sérum concentré et crème hydratante, formulés à partir d''actifs naturels.',
    array['3 produits', 'Formules véganes', 'Sans parabène ni silicone', 'Flacons rechargeables']::text[],
    'Formules à base d''actifs naturels', 'Conserver au sec, à l''abri de la chaleur',
    array['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80&h=1750', 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1400&q=80&h=1750']::text[],
    '[]'::jsonb,
    '{}'::text[],
    20, false, false, true, 20
  );

-- Exemple de code promo (désactivé). Pour le créer et l'activer :
-- insert into public.promo_codes (code, percent_off) values ('BIENVENUE10', 10);
