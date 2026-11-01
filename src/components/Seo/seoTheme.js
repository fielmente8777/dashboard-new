// Colours and small helpers shared by the SEO dashboard components.

// Icon chip colours. Each has a lighter text shade for the dark theme so
// the glyph keeps its contrast on a dark card.
export const KPI_TONES = {
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300",
  green: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300",
  violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
  sky: "bg-sky-500/10 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300",
};

// How a 0–100 visibility score reads. Ring colours are mid-tones that show
// on both themes; the badge tone handles the text.
const GRADES = [
  { min: 70, label: "Strong", tone: "green", ring: "stroke-emerald-500" },
  { min: 40, label: "Fair", tone: "amber", ring: "stroke-amber-500" },
  { min: 0, label: "Needs work", tone: "red", ring: "stroke-red-500" },
];
export const gradeOf = (score) => GRADES.find((grade) => score >= grade.min);

// counted bands (from countByBand) -> BandFilter options, "All" first
export const bandFilterOptions = (bands) => [
  { value: "all", label: "All", count: bands.reduce((sum, band) => sum + band.count, 0) },
  ...bands.map((band) => ({ value: band.label, label: band.label, color: band.color, count: band.count })),
];
