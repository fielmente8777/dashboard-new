import {
  Baby,
  Bed,
  Briefcase,
  Building2,
  Bus,
  Camera,
  Car,
  CircleDashed,
  Coffee,
  Dumbbell,
  Flower2,
  Gift,
  GraduationCap,
  Heart,
  Hotel,
  Instagram,
  Landmark,
  Mountain,
  Music,
  Palette,
  PenLine,
  Plane,
  Ship,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
  Tag,
  Tent,
  Train,
  Users,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useGetTradeCategoriesQuery } from "../../redux/api/tradeDirectoryApi";
import { SEGMENTS } from "./tradeUtils";

// the icon names the server may send (gian-new CATEGORY_ICONS); anything else shows a tag
const ICONS = {
  plane: Plane,
  briefcase: Briefcase,
  heart: Heart,
  "flower-2": Flower2,
  sparkles: Sparkles,
  landmark: Landmark,
  instagram: Instagram,
  "pen-line": PenLine,
  "utensils-crossed": UtensilsCrossed,
  "circle-dashed": CircleDashed,
  hotel: Hotel,
  bed: Bed,
  car: Car,
  bus: Bus,
  train: Train,
  ship: Ship,
  mountain: Mountain,
  tent: Tent,
  camera: Camera,
  music: Music,
  dumbbell: Dumbbell,
  "graduation-cap": GraduationCap,
  "building-2": Building2,
  store: Store,
  "shopping-bag": ShoppingBag,
  gift: Gift,
  coffee: Coffee,
  wine: Wine,
  palette: Palette,
  stethoscope: Stethoscope,
  baby: Baby,
  users: Users,
  tag: Tag,
};

/**
 * The Trade Directory categories from the server (built-in, staff-made, AI-made), as
 * { value, label, icon, color }, in their order. The built-in list is used until they load.
 *   segmentOf(key) -> that category (or a plain one for an unknown key)
 */
export function useTradeCategories() {
  const { data } = useGetTradeCategoriesQuery();
  const categories = useMemo(
    () =>
      data?.length
        ? data.map((c) => ({ value: c.key, label: c.label, icon: ICONS[c.icon] || Tag, color: c.color || "#64748b" }))
        : SEGMENTS,
    [data],
  );
  const segmentOf = useCallback(
    (key) =>
      categories.find((c) => c.value === key) || {
        value: key,
        label: String(key || "").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        icon: Tag,
        color: "#64748b",
      },
    [categories],
  );
  return { categories, segmentOf };
}
