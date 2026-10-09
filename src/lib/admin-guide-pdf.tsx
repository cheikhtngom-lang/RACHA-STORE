import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { GUIDE_CHAPTERS, GUIDE_INTRO, richText, type GuideBlock } from "@/lib/admin-guide";

// Version PDF du guide de l'administration (/admin/guide/pdf), avec les
// couleurs de la boutique sur fond clair, pour l'imprimer ou la garder.
// Polices intégrées au PDF (Helvetica, Times) : elles couvrent les accents.

const SITE = "https://www.rachamarket.com";

const color = {
  ink: "#242c27",
  stone: "#4c4a41",
  stoneLight: "#8c897c",
  gold: "#b78f4c",
  line: "#e4dcc9",
  sand: "#f1ebdd",
};

// Pas de coupure de mots en fin de ligne : la coupure par défaut est celle de l'anglais.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { paddingTop: 56, paddingBottom: 64, paddingHorizontal: 56, fontFamily: "Helvetica", fontSize: 10, color: color.stone, lineHeight: 1.55 },
  brand: { fontSize: 8, letterSpacing: 3, color: color.gold, marginBottom: 14 },
  title: { fontFamily: "Times-Roman", fontSize: 30, color: color.ink, lineHeight: 1.15, marginBottom: 10 },
  intro: { fontSize: 11, marginBottom: 6 },
  version: { fontSize: 8.5, color: color.stoneLight, marginBottom: 28 },
  toc: { backgroundColor: color.sand, padding: 18, marginBottom: 32 },
  tocTitle: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.5, color: color.ink, marginBottom: 8 },
  tocRow: { flexDirection: "row", marginBottom: 2.5 },
  tocNumber: { width: 20, color: color.gold },
  tocLink: { color: color.stone, textDecoration: "none" },
  chapter: { marginBottom: 26 },
  chapterHead: { flexDirection: "row", alignItems: "baseline", borderBottomWidth: 0.75, borderBottomColor: color.line, paddingBottom: 6, marginBottom: 10 },
  chapterNumber: { fontFamily: "Times-Roman", fontSize: 18, color: color.gold, width: 28 },
  chapterTitle: { fontFamily: "Times-Roman", fontSize: 18, color: color.ink },
  address: { fontSize: 8.5, color: color.stoneLight, marginTop: -4, marginBottom: 10 },
  paragraph: { marginBottom: 8 },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.5, color: color.ink, marginTop: 6, marginBottom: 6 },
  list: { marginBottom: 8 },
  item: { flexDirection: "row", marginBottom: 4 },
  marker: { width: 16, color: color.gold },
  itemText: { flex: 1 },
  note: { borderLeftWidth: 1.5, borderLeftColor: color.gold, paddingLeft: 10, color: color.ink, marginBottom: 8 },
  bold: { fontFamily: "Helvetica-Bold", color: color.ink },
  // Placé depuis le haut de la page A4 (841,89 pt) : avec « bottom », react-pdf
  // le calcule sur la hauteur de tout le document et il sort des pages.
  footer: {
    position: "absolute",
    top: 790,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: color.stoneLight,
    borderTopWidth: 0.75,
    borderTopColor: color.line,
    paddingTop: 8,
  },
});

function Rich({ text }: { text: string }) {
  return richText(text).map((segment, i) =>
    segment.bold ? (
      <Text key={i} style={styles.bold}>
        {segment.text}
      </Text>
    ) : (
      segment.text
    )
  );
}

function Block({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "p":
      return (
        <Text style={styles.paragraph}>
          <Rich text={block.text} />
        </Text>
      );
    case "heading":
      return <Text style={styles.heading}>{block.text.toUpperCase()}</Text>;
    case "steps":
    case "points":
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.item} wrap={false}>
              <Text style={styles.marker}>{block.type === "steps" ? `${i + 1}.` : "•"}</Text>
              <Text style={styles.itemText}>
                <Rich text={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case "note":
      return (
        <View style={styles.note} wrap={false}>
          <Text>
            <Rich text={block.text} />
          </Text>
        </View>
      );
  }
}

// Blocs regroupés pour la mise en page : un intertitre reste avec le bloc qui le suit.
function keepTogether(blocks: GuideBlock[]) {
  const groups: GuideBlock[][] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (last && last.length === 1 && last[0].type === "heading") last.push(block);
    else groups.push([block]);
  }
  return groups;
}

export function GuideDocument({ date }: { date: Date }) {
  const version = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Dakar" });
  return (
    <Document title="Guide de l'administration" author="Racha Store" language="fr">
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>RACHA STORE</Text>
        <Text style={styles.title}>Guide de l&apos;administration</Text>
        <Text style={styles.intro}>{GUIDE_INTRO}</Text>
        <Text style={styles.version}>Version du {version} · {SITE.replace("https://", "")}/admin</Text>

        <View style={styles.toc}>
          <Text style={styles.tocTitle}>SOMMAIRE</Text>
          {GUIDE_CHAPTERS.map((chapter, i) => (
            <View key={chapter.id} style={styles.tocRow}>
              <Text style={styles.tocNumber}>{i + 1}.</Text>
              <Link src={`#${chapter.id}`} style={styles.tocLink}>
                {chapter.title}
              </Link>
            </View>
          ))}
        </View>

        {GUIDE_CHAPTERS.map((chapter, i) => {
          const [first, ...rest] = keepTogether(chapter.blocks);
          return (
            <View key={chapter.id} id={chapter.id} style={styles.chapter}>
              {/* Titre du chapitre jamais seul en bas de page : il passe avec son premier paragraphe. */}
              <View wrap={false}>
                <View style={styles.chapterHead}>
                  <Text style={styles.chapterNumber}>{i + 1}.</Text>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
                {chapter.href && (
                  <Text style={styles.address}>
                    Dans l&apos;administration : {SITE.replace("https://", "")}
                    {chapter.href}
                  </Text>
                )}
                {first?.map((block, j) => <Block key={j} block={block} />)}
              </View>
              {rest.map((group, j) =>
                group.length > 1 ? (
                  <View key={j} wrap={false}>
                    {group.map((block, k) => (
                      <Block key={k} block={block} />
                    ))}
                  </View>
                ) : (
                  <Block key={j} block={group[0]} />
                )
              )}
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>Racha Store · Guide de l&apos;administration</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
