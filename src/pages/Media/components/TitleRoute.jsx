import { ArrowRight } from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import { useResolveTitleQuery } from "../../../redux/api/mediaApi";

const HOW = {
  existing_sub: "existing collection",
  existing: "existing collection",
  standard: "standard category",
  inventory: "inventory item",
  keyword: "new, from the title",
  ai: "AI picks the collection",
};

// Live preview of where a title routes the images: "→ Rooms › Deluxe Room".
const TitleRoute = ({ title }) => {
  const q = useDebounce(title.trim(), 350);
  const { data: route, isFetching } = useResolveTitleQuery(q, { skip: !q });
  if (!q) return <span className="text-xs text-app-text-faint">Optional. Leave empty and the AI names and sorts each image.</span>;
  if (isFetching && !route) return <span className="text-xs text-app-text-muted">Checking…</span>;
  if (!route) return null;
  const path = [route.collection || "AI's collection", route.subCollection].filter(Boolean).join(" › ");
  return (
    <span className="inline-flex items-center gap-1 text-xs text-app-text-muted">
      <ArrowRight size={12} aria-hidden="true" />
      <span className="font-medium text-app-text">{path}</span>
      <span>({HOW[route.matchedBy]})</span>
    </span>
  );
};

export default TitleRoute;
