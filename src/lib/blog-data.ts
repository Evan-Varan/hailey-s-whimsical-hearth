import gCrochet from "@/assets/gallery-crochet.jpg";
import gTarot from "@/assets/gallery-tarot.jpg";
import gHorse from "@/assets/gallery-horse.jpg";
import gCat from "@/assets/gallery-cat.jpg";
import gJournal from "@/assets/gallery-journal.jpg";
import gMoon from "@/assets/gallery-moon.jpg";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  chip: "" | "rose" | "gold";
  image: string;
  date: string;
  read: string;
  deckNote: string;
  body: string[];
};

export const featured: JournalPost[] = [
  {
    slug: "bergamot-tea-waxing-moon",
    title: "On Brewing Bergamot Tea Beneath the Waxing Moon",
    excerpt: "A slow Sunday ritual: steam, citrus peel, and a small spell for clarity. What I learned about beginnings from the High Priestess this week…",
    tag: "Tarot",
    chip: "rose" as const,
    image: gTarot,
    date: "Nov 12",
    read: "6 min",
    deckNote: "The High Priestess, pulled after the kettle clicked off.",
    body: [
      "I made bergamot tea at the hour when the kitchen window turns blue and everything on the counter looks like it belongs in a spell. The moon was not full yet, only gathering herself, which felt more useful than brightness. Beginnings are easier to trust when they are still private.",
      "The High Priestess kept me company from the saucer. I did not ask her a dramatic question. I asked what wants patience. The answer was almost annoyingly gentle: let the quiet part of the plan stay quiet until it has roots.",
      "So I peeled a thin curl of citrus, stirred honey into the cup, and wrote three sentences I was not allowed to edit. That was the whole ritual. Steam, sweetness, a page that did not need to become anything impressive.",
      "If you try it tonight, choose a cup that feels good in your hands. Pull a card if you want, or do not. Write one true thing, then let the rest of the evening remain unfinished.",
    ],
  },
  {
    slug: "sage-granny-square-blanket",
    title: "The Sage Granny Square Blanket — Pattern + Notes",
    excerpt: "After three months and a very opinionated cat, my mossy heirloom is finished. Free pattern, yarn weight notes, and the playlist that got me there.",
    tag: "Crochet",
    chip: "" as const,
    image: gCrochet,
    date: "Nov 09",
    read: "9 min",
    deckNote: "Finished with two skeins left and one cat hair in every seam.",
    body: [
      "The blanket is finally heavy enough to feel like weather. It started as a stack of sage squares in a basket by the sofa and became, somewhere around the thirty-seventh motif, the project I reached for whenever the day had too many edges.",
      "I used a soft worsted yarn, a 5 mm hook, and a simple three-round granny square. The color changes do most of the work: moss, cream, fern, a little smoke-blue when the green needed air. I joined the squares with a flat slip stitch because I wanted the seams to look like tiny paths.",
      "Pippin supervised badly. He slept on the blocking mat, stole the stitch markers, and once dragged a square into the hallway like a trophy. I am counting this as collaboration.",
      "The pattern is forgiving. Make the squares until you are tired of making squares, then make six more. That is usually the correct blanket size.",
    ],
  },
  {
    slug: "druid-who-talks-to-horses",
    title: "Building a Druid Who Talks to Horses (DnD Session 14)",
    excerpt: "We met a creature in the Hollowmere who only spoke in lullabies. Notes on roleplaying gentleness and a rough sketch of the new mount.",
    tag: "DnD",
    chip: "gold" as const,
    image: gJournal,
    date: "Nov 05",
    read: "11 min",
    deckNote: "Session notes written beside a very smudged map of Hollowmere.",
    body: [
      "I did not mean to build a druid around listening. I meant to build a practical character with good survival checks and a reason to be near horses. Then the campaign wandered into Hollowmere, and every sensible plan became moss-covered and strange.",
      "The creature we met only spoke in lullabies. Not lyrics exactly, more like the shape of a song remembered by water. My druid answered by lowering her voice, slowing her hands, and asking the horse beside her to take one step forward only if he wanted to.",
      "It changed the whole session. The table got quiet in that rare way where everyone is leaning in, not waiting for their turn but listening for the next true thing. Gentleness became a tactic. Patience became plot.",
      "By the end of the night, I had a new mount, a page of rough sketches, and a reminder that softness is not the opposite of agency. Sometimes it is the door.",
    ],
  },
];

export const morePosts: JournalPost[] = [
  {
    slug: "cats-of-my-neighborhood",
    title: "A Field Guide to the Cats of My Neighborhood",
    excerpt: "Seven cats, seven names I made up, and a rough map of their territories drawn in coloured pencil.",
    tag: "Cats", chip: "", image: gCat, date: "Oct 28", read: "5 min",
    deckNote: "Compiled from porch observations and one suspicious stare.",
    body: [
      "There are seven cats who treat our street like a kingdom with unclear borders. I know none of their legal names, so I have provided better ones: Marmalade, The Duchess, Shoelace, Tiny Thunder, Professor Biscuit, Fern, and The Gray Accountant.",
      "Marmalade owns the sunny patch by the mailbox. The Duchess prefers the hydrangeas and looks offended by weather. Shoelace is long, black, and always halfway under a gate. Professor Biscuit has the solemn face of someone who has read every book in the house.",
      "I drew a map in colored pencil because some forms of affection require documentation. It is wildly inaccurate, except emotionally.",
      "The Gray Accountant appeared only once, sat on the curb, judged my recycling, and left. I respect him deeply.",
    ],
  },
  {
    slug: "riding-juniper-at-first-frost",
    title: "Riding Juniper at First Frost",
    excerpt: "On the quiet conversation between a horse and a person who is learning to listen.",
    tag: "Horses", chip: "gold", image: gHorse, date: "Oct 22", read: "7 min",
    deckNote: "Barn notes from a morning that smelled like hay and cold iron.",
    body: [
      "The first frost made the pasture look newly invented. Juniper stepped into it like she was testing a rumor. Every blade of grass held a little light, and every sound seemed careful.",
      "Riding her has taught me that listening is physical. It is in the elbows, the breath, the willingness to stop asking so loudly. When I softened my hands, she softened her back. When I rushed, she told the truth immediately.",
      "We did nothing impressive. Walk, halt, circles, a short trot along the fence line. But the whole morning felt like a conversation where both of us remembered our manners.",
      "I left with cold fingers, dusty boots, and the sense that progress sometimes looks like being corrected by someone kinder than you expected.",
    ],
  },
  {
    slug: "pisces-moon-reading",
    title: "A Pisces Moon Reading for the Tender-Hearted",
    excerpt: "Notes from my journal under tonight's sky — and a small ritual you can do with a candle and a cup of water.",
    tag: "Astrology", chip: "rose", image: gMoon, date: "Oct 18", read: "8 min",
    deckNote: "A water-sign reading for the feelings that arrived without knocking.",
    body: [
      "A Pisces moon makes everything porous. Music gets through. Old messages get through. The little ache you ignored while answering email arrives with a chair and a suitcase.",
      "Tonight's reading was not dramatic, but it was honest. The invitation was to stop calling sensitivity a problem to solve. Some days the heart is simply weather, and the work is shelter.",
      "I put a cup of water beside a candle and wrote down what I was carrying that did not belong entirely to me. Then I poured the water into the rosemary pot by the door. It felt practical, which is my favorite kind of magic.",
      "Be soft tonight, but be specific. Name the feeling. Give it a place to sit. Do not let it drive.",
    ],
  },
  {
    slug: "slow-sundays-half-finished-things",
    title: "On Slow Sundays and Half-Finished Things",
    excerpt: "A small love letter to the projects we put down for a while and the joy of picking them up again.",
    tag: "Lifestyle", chip: "", image: gJournal, date: "Oct 11", read: "4 min",
    deckNote: "Written with laundry half-folded and no apology.",
    body: [
      "I used to think a half-finished project was evidence against me. Now I think it is often proof that I was alive in more than one direction. The basket of mending, the draft with three good paragraphs, the scarf that paused at winter's edge: all of them are waiting, not accusing.",
      "Slow Sunday is when I let the waiting things speak. Not all at once. One drawer, one row, one page. The point is not to become suddenly disciplined. The point is to return without making a courtroom out of it.",
      "Today I picked up an old crochet square and remembered exactly why I stopped. The color was wrong. I changed it. The project forgave me immediately.",
      "May we all be allowed to resume imperfectly.",
    ],
  },
];

export const journalPosts = [...featured, ...morePosts];

export function getJournalPost(slug: string) {
  return journalPosts.find((post) => post.slug === slug);
}

export const recentJournal = [
  { date: "Nov 14", title: "A small list of things that did not go wrong today", slug: "bergamot-tea-waxing-moon" },
  { date: "Nov 11", title: "Letter to my future self, written by candlelight", slug: "sage-granny-square-blanket" },
  { date: "Nov 07", title: "On the soft discipline of finishing what you start", slug: "slow-sundays-half-finished-things" },
  { date: "Nov 02", title: "The barn cat and her seven small ghosts", slug: "cats-of-my-neighborhood" },
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
