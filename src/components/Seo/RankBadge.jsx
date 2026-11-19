import { MapPin } from "lucide-react";
import Badge from "../ui/Badge";
import Icon from "../ui/Icon";

// A Google rank, coloured by its band. `tone` comes from the page's rank
// scale (Maps and search use different ones); `icon` defaults to a map pin.
const RankBadge = ({ rank, tone, icon = MapPin }) => (
  <Badge tone={tone} className="gap-1 tabular-nums">
    <Icon icon={icon} size="xs" />
    {rank == null ? "—" : `#${Math.round(rank)}`}
  </Badge>
);

export default RankBadge;
