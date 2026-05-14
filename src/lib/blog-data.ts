import gCrochet from "@/assets/gallery-crochet.jpg";
import gTarot from "@/assets/gallery-tarot.jpg";
import gHorse from "@/assets/gallery-horse.jpg";
import gCat from "@/assets/gallery-cat.jpg";
import gJournal from "@/assets/gallery-journal.jpg";
import gMoon from "@/assets/gallery-moon.jpg";

export const featured = [
  {
    title: "On Brewing Bergamot Tea Beneath the Waxing Moon",
    excerpt: "A slow Sunday ritual: steam, citrus peel, and a small spell for clarity. What I learned about beginnings from the High Priestess this week…",
    tag: "Tarot",
    chip: "rose" as const,
    image: gTarot,
    date: "Nov 12",
    read: "6 min",
  },
  {
    title: "The Sage Granny Square Blanket — Pattern + Notes",
    excerpt: "After three months and a very opinionated cat, my mossy heirloom is finished. Free pattern, yarn weight notes, and the playlist that got me there.",
    tag: "Crochet",
    chip: "" as const,
    image: gCrochet,
    date: "Nov 09",
    read: "9 min",
  },
  {
    title: "Building a Druid Who Talks to Horses (DnD Session 14)",
    excerpt: "We met a creature in the Hollowmere who only spoke in lullabies. Notes on roleplaying gentleness and a rough sketch of the new mount.",
    tag: "DnD",
    chip: "gold" as const,
    image: gJournal,
    date: "Nov 05",
    read: "11 min",
  },
];

export const morePosts = [
  {
    title: "A Field Guide to the Cats of My Neighborhood",
    excerpt: "Seven cats, seven names I made up, and a rough map of their territories drawn in coloured pencil.",
    tag: "Cats", chip: "" as const, image: gCat, date: "Oct 28", read: "5 min",
  },
  {
    title: "Riding Juniper at First Frost",
    excerpt: "On the quiet conversation between a horse and a person who is learning to listen.",
    tag: "Horses", chip: "gold" as const, image: gHorse, date: "Oct 22", read: "7 min",
  },
  {
    title: "A Pisces Moon Reading for the Tender-Hearted",
    excerpt: "Notes from my journal under tonight's sky — and a small ritual you can do with a candle and a cup of water.",
    tag: "Astrology", chip: "rose" as const, image: gMoon, date: "Oct 18", read: "8 min",
  },
  {
    title: "On Slow Sundays and Half-Finished Things",
    excerpt: "A small love letter to the projects we put down for a while and the joy of picking them up again.",
    tag: "Lifestyle", chip: "" as const, image: gJournal, date: "Oct 11", read: "4 min",
  },
];

export const recentJournal = [
  { date: "Nov 14", title: "A small list of things that did not go wrong today" },
  { date: "Nov 11", title: "Letter to my future self, written by candlelight" },
  { date: "Nov 07", title: "On the soft discipline of finishing what you start" },
  { date: "Nov 02", title: "The barn cat and her seven small ghosts" },
];

export const galleryItems = [
  { src: gCrochet, span: "row-span-2", alt: "Crochet doily and yarn" },
  { src: gMoon, span: "", alt: "Moon and constellations" },
  { src: gCat, span: "row-span-2", alt: "Sleeping cat" },
  { src: gTarot, span: "", alt: "Tarot spread" },
  { src: gHorse, span: "row-span-2", alt: "Chestnut horse at dusk" },
  { src: gJournal, span: "", alt: "Open journal" },
  { src: gMoon, span: "", alt: "Crescent moon over pines" },
  { src: gCrochet, span: "row-span-2", alt: "Granny square in progress" },
  { src: gTarot, span: "", alt: "Candles and cards" },
];
